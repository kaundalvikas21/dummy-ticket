import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

// Create admin client for database operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

/**
 * Refresh sort orders for a specific content type to ensure gapless sequence
 * @param {string} contentType - 'news' or 'blog'
 * @returns {Promise<void>}
 */
async function refreshSortOrders(contentType) {
  try {
    // Fetch all items of the specified content type, ordered by current sort_order
    const { data: items, error } = await supabaseAdmin
      .from('homepage_news_blog')
      .select('id, sort_order')
      .eq('content_type', contentType)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error(`Error fetching items for ${contentType}:`, error)
      throw new Error(`Failed to fetch ${contentType} items for order refresh`)
    }

    // Update each item with new consecutive sort_order (1, 2, 3...)
    const updates = items.map((item, index) => {
      const newSortOrder = index + 1
      return supabaseAdmin
        .from('homepage_news_blog')
        .update({ sort_order: newSortOrder })
        .eq('id', item.id)
    })

    // Execute all updates in parallel
    await Promise.all(updates)

    console.log(`Successfully refreshed sort orders for ${contentType} (${items.length} items)`)
  } catch (error) {
    console.error(`Error refreshing sort orders for ${contentType}:`, error)
    throw error
  }
}

/**
 * Swap sort orders between two items of the same content type
 * @param {string} contentType - 'news' or 'blog'
 * @param {number} itemId1 - First item ID
 * @param {number} itemId2 - Second item ID
 * @returns {Promise<void>}
 */
async function swapSortOrders(contentType, itemId1, itemId2) {
  try {
    // Get current sort orders for both items
    const { data: items, error } = await supabaseAdmin
      .from('homepage_news_blog')
      .select('id, sort_order')
      .eq('content_type', contentType)
      .in('id', [itemId1, itemId2])

    if (error) {
      console.error('Error fetching items for swap:', error)
      throw new Error('Failed to fetch items for sort order swap')
    }

    if (items.length !== 2) {
      throw new Error('Both items must exist and be of the same content type')
    }

    const item1 = items.find(item => item.id === itemId1)
    const item2 = items.find(item => item.id === itemId2)

    // Swap sort orders
    await Promise.all([
      supabaseAdmin
        .from('homepage_news_blog')
        .update({ sort_order: item2.sort_order })
        .eq('id', itemId1),
      supabaseAdmin
        .from('homepage_news_blog')
        .update({ sort_order: item1.sort_order })
        .eq('id', itemId2)
    ])

    console.log(`Successfully swapped sort orders for ${contentType} items ${itemId1} and ${itemId2}`)
  } catch (error) {
    console.error('Error swapping sort orders:', error)
    throw error
  }
}

export async function GET(request, { params }) {
  try {
    const { id } = await params
    // supabase is already imported

    // Fetch single homepage news blog item with translations
    const { data: item, error } = await supabase
      .from('homepage_news_blog')
      .select(`
        *,
        homepage_news_blog_translations (
          locale,
          title
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return new Response(JSON.stringify({ error: 'Homepage news blog item not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        })
      }
      console.error('Error fetching homepage news blog item:', error)
      return new Response(JSON.stringify({ error: 'Failed to fetch homepage news blog item' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Format translations
    const translations = item.homepage_news_blog_translations || []
    const translationsMap = {}

    translations.forEach(translation => {
      translationsMap[translation.locale] = {
        title: translation.title
      }
    })

    const formattedItem = {
      id: item.id,
      content_type: item.content_type,
      external_link: item.external_link,
      status: item.status,
      sort_order: item.sort_order,
      created_at: item.created_at,
      updated_at: item.updated_at,
      translations: translationsMap
    }

    return new Response(JSON.stringify({ success: true, data: formattedItem }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(JSON.stringify({ error: 'Unexpected error occurred' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { content_type, external_link, status, translations } = body

    // supabase is already imported

    // Validate required fields
    if (content_type && !['news', 'blog'].includes(content_type)) {
      return new Response(JSON.stringify({ error: 'Invalid content_type' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Update the main item
    const updateData = {}
    if (external_link !== undefined) updateData.external_link = external_link
    if (status) updateData.status = status
    if (translations && translations.en && translations.en.title) updateData.title = translations.en.title

    // Handle content_type change with proper sort_order
    if (content_type) {
      // Get current item to check if content type is changing
      const { data: currentItem } = await supabase
        .from('homepage_news_blog')
        .select('content_type, sort_order')
        .eq('id', id)
        .single()

      if (currentItem && currentItem.content_type !== content_type) {
        // Content type is changing, need to reassign sort_order
        const { data: maxOrderResult } = await supabase
          .from('homepage_news_blog')
          .select('sort_order')
          .eq('content_type', content_type)
          .order('sort_order', { ascending: false })
          .limit(1)

        const nextSortOrder = maxOrderResult && maxOrderResult[0] ? maxOrderResult[0].sort_order + 1 : 1
        updateData.content_type = content_type
        updateData.sort_order = nextSortOrder
      }
    }

    updateData.updated_at = new Date().toISOString()

    const { error: updateError } = await supabase
      .from('homepage_news_blog')
      .update(updateData)
      .eq('id', id)

    if (updateError) {
      console.error('Error updating homepage news blog item:', updateError)
      return new Response(JSON.stringify({ error: 'Failed to update homepage news blog item' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Update translations if provided
    if (translations) {
      const translationPromises = Object.entries(translations).map(async ([locale, translationData]) => {
        if (translationData.title) {
          // Upsert translation
          const { error: translationError } = await supabase
            .from('homepage_news_blog_translations')
            .upsert({
              homepage_news_blog_id: id,
              locale,
              title: translationData.title,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'homepage_news_blog_id,locale'
            })

          if (translationError) {
            throw translationError
          }
        }
      })

      await Promise.all(translationPromises)
    }

    return new Response(JSON.stringify({
      success: true,
      data: { message: 'Homepage news blog item updated successfully' }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in PUT /api/homepage-news-blog/[id]:', error)
    return new Response(JSON.stringify({ error: 'Failed to update homepage news blog item' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { itemId, direction, contentType } = body

    // Validate required fields
    if (!itemId || !direction || !contentType) {
      return new Response(JSON.stringify({ error: 'Missing required fields: itemId, direction, contentType' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (!['up', 'down'].includes(direction)) {
      return new Response(JSON.stringify({ error: 'Invalid direction. Must be "up" or "down"' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (!['news', 'blog'].includes(contentType)) {
      return new Response(JSON.stringify({ error: 'Invalid content type. Must be "news" or "blog"' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Get current item and find adjacent item for swapping
    const { data: currentItem } = await supabaseAdmin
      .from('homepage_news_blog')
      .select('id, sort_order')
      .eq('id', itemId)
      .eq('content_type', contentType)
      .single()

    if (!currentItem) {
      return new Response(JSON.stringify({ error: 'Item not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Find adjacent item
    let adjacentItemQuery = supabaseAdmin
      .from('homepage_news_blog')
      .select('id, sort_order')
      .eq('content_type', contentType)

    if (direction === 'up') {
      adjacentItemQuery = adjacentItemQuery
        .lt('sort_order', currentItem.sort_order)
        .order('sort_order', { ascending: false })
        .limit(1)
    } else {
      adjacentItemQuery = adjacentItemQuery
        .gt('sort_order', currentItem.sort_order)
        .order('sort_order', { ascending: true })
        .limit(1)
    }

    const { data: adjacentItem } = await adjacentItemQuery

    if (!adjacentItem || adjacentItem.length === 0) {
      return new Response(JSON.stringify({ error: `Cannot move ${direction} - ${direction === 'up' ? 'already at top' : 'already at bottom'}` }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Swap sort orders
    await swapSortOrders(contentType, itemId, adjacentItem[0].id)

    return new Response(JSON.stringify({
      success: true,
      data: { message: `Successfully moved item ${direction}` }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in POST /api/homepage-news-blog/[id] (reorder):', error)
    return new Response(JSON.stringify({ error: 'Failed to reorder item' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params

    // Get the item content type before deletion for order refresh
    const { data: itemToDelete } = await supabase
      .from('homepage_news_blog')
      .select('content_type')
      .eq('id', id)
      .single()

    if (!itemToDelete) {
      return new Response(JSON.stringify({ error: 'Homepage news blog item not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Delete the homepage news blog item (translations will be deleted automatically due to CASCADE)
    const { error } = await supabase
      .from('homepage_news_blog')
      .delete()
      .eq('id', id)

    if (error) {
      if (error.code === 'PGRST116') {
        return new Response(JSON.stringify({ error: 'Homepage news blog item not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        })
      }
      console.error('Error deleting homepage news blog item:', error)
      return new Response(JSON.stringify({ error: 'Failed to delete homepage news blog item' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Refresh sort orders for the content type to ensure gapless sequence
    try {
      await refreshSortOrders(itemToDelete.content_type)
    } catch (refreshError) {
      console.error('Error refreshing sort orders after deletion:', refreshError)
      // Don't fail the delete operation, just log the error
    }

    return new Response(JSON.stringify({
      success: true,
      data: { message: 'Homepage news blog item deleted successfully' }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in DELETE /api/homepage-news-blog/[id]:', error)
    return new Response(JSON.stringify({ error: 'Failed to delete homepage news blog item' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}