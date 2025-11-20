import { supabase } from '@/lib/supabase'

export async function POST(request, { params }) {
  try {
    const { id } = await params
    const { translations } = await request.json()

    if (!translations || typeof translations !== 'object') {
      return new Response(JSON.stringify({ error: 'Translations are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // supabase is already imported

    // Validate that the homepage news blog item exists
    const { data: item, error: itemError } = await supabase
      .from('homepage_news_blog')
      .select('id')
      .eq('id', id)
      .single()

    if (itemError || !item) {
      return new Response(JSON.stringify({ error: 'Homepage news blog item not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Process translations
    const translationPromises = Object.entries(translations).map(async ([locale, translationData]) => {
      if (translationData && translationData.title) {
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

    return new Response(JSON.stringify({
      success: true,
      data: { message: 'Homepage news blog translations updated successfully' }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in POST /api/homepage-news-blog/[id]/translations/batch:', error)
    return new Response(JSON.stringify({ error: 'Failed to update homepage news blog translations' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}