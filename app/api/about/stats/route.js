import { NextResponse } from 'next/server'
import {
  requireAdmin,
  createSupabaseClientWithAuth,
  createAuthError,
  validateInput
} from "@/lib/auth-helper"
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function GET(request) {
  try {
    // For public read access, use server client (RLS will handle filtering)
    const supabase = await createServerClient()
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale') || 'en'

    // First try to get stats with translations
    let { data: stats, error } = await supabase
      .from('about_stats')
      .select(`
        *,
        about_stats_translations (
          label,
          value,
          locale
        )
      `)
      .eq('status', 'active')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })


    if (error) {
      console.error('Error fetching about stats:', error)
      return NextResponse.json(
        { error: 'Failed to fetch about stats' },
        { status: 500 }
      )
    }

    // Transform the data to include fallbacks and process translations
    const transformedStats = stats.map(stat => {
      // Find translation for current locale, fallback to any translation, then to original
      const translation = stat.about_stats_translations?.find(t => t.locale === locale) ||
                         stat.about_stats_translations?.[0] ||
                         null

      return {
        id: stat.id,
        icon: stat.icon,
        value: translation?.value || stat.value,
        label: translation?.label || stat.label,
        status: stat.status,
        sort_order: stat.sort_order,
        created_at: stat.created_at,
        updated_at: stat.updated_at,
        locale: translation?.locale || locale || 'en',
        fallback_label: stat.label,
        fallback_value: stat.value
      }
    })

    return NextResponse.json({ stats: transformedStats })
  } catch (error) {
    console.error('Error in GET /api/about/stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    // SECURITY: Require admin authentication
    const supabase = await createSupabaseClientWithAuth()
    await requireAdmin(supabase)

    // Validate input data
    const body = await request.json()
    validateInput(body, ['icon', 'value', 'label'])

    const { icon, value, label, status = 'active', sort_order = 1 } = body

    // Use admin client for database operations to properly handle RLS
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

    const { data: stat, error } = await supabaseAdmin
      .from('about_stats')
      .insert([
        {
          icon,
          value,
          label,
          status,
          sort_order
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating about stat:', error)
      return createAuthError('Failed to create about stat', 500)
    }

    return NextResponse.json({ stat }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/about/stats:', error)
    return createAuthError('Internal server error', 500)
  }
}