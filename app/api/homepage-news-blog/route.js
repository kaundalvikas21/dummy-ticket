import { supabase } from '@/lib/supabase'
import { 
  requireAdmin, 
  createSupabaseClientWithAuth, 
  createAuthError, 
  createSuccessResponse 
} from "@/lib/auth-helper"

export async function GET() {
  try {
    // supabase is already imported

    // Fetch only active homepage news and blog items with their translations
    const { data: items, error } = await supabase
      .from('homepage_news_blog')
      .select(`
        *,
        homepage_news_blog_translations (
          locale,
          title
        )
      `)
      .eq('status', 'active')
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Error fetching homepage news blog items:', error)
      return new Response(JSON.stringify({ error: 'Failed to fetch homepage news blog items' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Group items by content type
    const groupedItems = {
      news: [],
      blog: []
    }

    items.forEach(item => {
      const translations = item.homepage_news_blog_translations || []
      const translationsMap = {}

      translations.forEach(translation => {
        translationsMap[translation.locale] = {
          title: translation.title
        }
      })

      const itemWithTranslations = {
        id: item.id,
        content_type: item.content_type,
        title: item.title, // Add the main title
        external_link: item.external_link,
        status: item.status,
        sort_order: item.sort_order,
        created_at: item.created_at,
        updated_at: item.updated_at,
        translations: translationsMap
      }

      groupedItems[item.content_type].push(itemWithTranslations)
    })

      return new Response(JSON.stringify({ success: true, data: groupedItems }), {
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

export async function POST(request) {
  try {
    // Check admin authentication using Supabase
    const supabase = await createSupabaseClientWithAuth()
    await requireAdmin(supabase)

    const body = await request.json()
    const { content_type, external_link, status = 'active', translations } = body

    // Validate required fields
    if (!content_type || !['news', 'blog'].includes(content_type)) {
      return new Response(JSON.stringify({ error: 'Invalid content_type' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (!translations || !translations.en || !translations.en.title) {
      return new Response(JSON.stringify({ error: 'English translation is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // supabase is already imported

    // Get the highest sort_order for the content type to append at the end
    const { data: maxOrderResult } = await supabase
      .from('homepage_news_blog')
      .select('sort_order')
      .eq('content_type', content_type)
      .order('sort_order', { ascending: false })
      .limit(1)

    const nextSortOrder = maxOrderResult && maxOrderResult[0] ? maxOrderResult[0].sort_order + 1 : 1

    // Create the homepage news blog item with English title
    const { data: newItem, error: itemError } = await supabase
      .from('homepage_news_blog')
      .insert([{
        content_type,
        external_link: external_link || null,
        status,
        sort_order: nextSortOrder,
        title: translations.en.title // Set English title as main title
      }])
      .select()
      .single()

    if (itemError) {
      console.error('Error creating homepage news blog item:', itemError)
      return new Response(JSON.stringify({ error: 'Failed to create homepage news blog item' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Create translations
    const translationPromises = Object.entries(translations).map(async ([locale, translationData]) => {
      if (translationData.title) {
        const { error: translationError } = await supabase
          .from('homepage_news_blog_translations')
          .insert([{
            homepage_news_blog_id: newItem.id,
            locale,
            title: translationData.title
          }])

        if (translationError) {
          throw translationError
        }
      }
    })

    await Promise.all(translationPromises)

    return new Response(JSON.stringify({
      success: true,
      data: { id: newItem.id, message: 'Homepage news blog item created successfully' }
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in POST /api/homepage-news-blog:', error)
    return new Response(JSON.stringify({ error: 'Failed to create homepage news blog item' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}