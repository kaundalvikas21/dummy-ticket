import { NextResponse } from 'next/server'
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

    // Fetch stats with translations
    const { data: stats, error } = await supabaseAdmin
      .from('about_stats')
      .select(`
        *,
        about_stats_translations (
          label,
          value,
          locale
        )
      `)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching about stats:', error)
      return createAuthError('Failed to fetch about stats', 500)
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Error in GET /api/about/stats/admin:', error)
    return createAuthError('Internal server error', 500)
  }
}