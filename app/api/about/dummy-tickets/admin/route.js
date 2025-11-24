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
    const supabase = createSupabaseClientWithAuth(request)
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

    const { data: tickets, error } = await supabaseAdmin
      .from('about_dummy_tickets')
      .select(`
        *,
        about_dummy_tickets_translations (
          id,
          locale,
          title,
          content,
          created_at,
          updated_at
        )
      `)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Error fetching dummy tickets:', error)
      return createAuthError('Failed to fetch dummy tickets', 500)
    }

    return NextResponse.json({ tickets })
  } catch (error) {
    console.error('Error in GET /api/about/dummy-tickets/admin:', error)
    return createAuthError('Internal server error', 500)
  }
}