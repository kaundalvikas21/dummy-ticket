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

    const { data: faqs, error } = await supabaseAdmin
      .from('faqs')
      .select(`
        *,
        faq_translations (
          id,
          locale,
          question,
          answer,
          created_at,
          updated_at
        )
      `)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching FAQs:', error)
      return createAuthError('Failed to fetch FAQs', 500)
    }

    return NextResponse.json({ faqs })
  } catch (error) {
    console.error('Error in GET /api/faqs/admin:', error)
    return createAuthError('Internal server error', 500)
  }
}