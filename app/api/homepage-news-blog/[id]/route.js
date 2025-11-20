import { supabase } from '@/lib/supabase'

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

export async function DELETE(request, { params }) {
  try {
    const { id } = await params
    // supabase is already imported

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