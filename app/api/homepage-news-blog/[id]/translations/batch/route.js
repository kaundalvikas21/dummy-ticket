import { NextResponse } from 'next/server'
import {
  requireAdmin,
  createSupabaseClientWithAuth,
  createAuthError,
  createSuccessResponse
} from "@/lib/auth-helper"
import { createClient } from '@supabase/supabase-js'

export async function POST(request, { params }) {
  try {
    // SECURITY: Require admin authentication
    const supabase = await createSupabaseClientWithAuth()
    await requireAdmin(supabase)

    const { id } = await params
    const { translations } = await request.json()

    if (!translations || typeof translations !== 'object') {
      return createAuthError('Translations are required', 400)
    }

    // Use service role client for database operations to properly handle RLS
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

    // Validate that the homepage news blog item exists
    const { data: item, error: itemError } = await supabaseAdmin
      .from('homepage_news_blog')
      .select('id')
      .eq('id', id)
      .single()

    if (itemError || !item) {
      return createAuthError('Homepage news blog item not found', 404)
    }

    // Process translations
    const translationPromises = Object.entries(translations).map(async ([locale, translationData]) => {
      if (translationData && translationData.title) {
        // Upsert translation
        const { error: translationError } = await supabaseAdmin
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

    return createSuccessResponse({
      message: 'Homepage news blog translations updated successfully'
    })

  } catch (error) {
    console.error('Error in POST /api/homepage-news-blog/[id]/translations/batch:', error)

    // Handle authentication errors specifically
    if (error.message.includes('Admin') || error.message.includes('Authentication')) {
      return createAuthError(error.message, 403)
    }

    return createAuthError('Failed to update homepage news blog translations', 500)
  }
}