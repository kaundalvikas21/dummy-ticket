import {
  requireAdmin,
  createSupabaseClientWithAuth,
  createAuthError
} from "@/lib/auth-helper"
import { createClient } from '@supabase/supabase-js'

export async function GET(request) {
  try {
    // SECURITY: Require admin authentication
    const supabase = await createSupabaseClientWithAuth()
    await requireAdmin(supabase)

    // Use admin client for database operations to bypass RLS if needed
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

    // Fetch ALL homepage news and blog items (including inactive) for admin panel
    const { data: items, error } = await supabaseAdmin
      .from('homepage_news_blog')
      .select(`
        *,
        homepage_news_blog_translations (
          locale,
          title
        )
      `)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Error fetching homepage news blog items:', error)
      return createAuthError('Failed to fetch homepage news blog items', 500)
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
    return createAuthError('Unexpected error occurred', 500)
  }
}