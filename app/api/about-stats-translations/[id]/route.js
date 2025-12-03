import { createClient } from '@supabase/supabase-js'
import {
  requireAdmin,
  createSupabaseClientWithAuth,
  createAuthError
} from "@/lib/auth-helper"
import { NextResponse } from 'next/server'

export async function PUT(request, { params }) {
  try {
    // SECURITY: Require admin authentication
    const supabaseAuth = createSupabaseClientWithAuth(request)
    await requireAdmin(supabaseAuth)

    const { id } = await params
    const body = await request.json()
    const { label, value } = body

    // Validation
    if (!label) {
      return createAuthError('Label is required', 400)
    }

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

    const { data: translation, error } = await supabaseAdmin
      .from('about_stats_translations')
      .update({
        label,
        value,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating translation:', error)
      return createAuthError('Failed to update translation', 500)
    }

    if (!translation) {
      return createAuthError('Translation not found', 404)
    }

    return NextResponse.json({ translation })
  } catch (error) {
    console.error('Error in PUT /api/about-stats-translations/[id]:', error)
    return createAuthError('Internal server error', 500)
  }
}

export async function DELETE(request, { params }) {
  try {
    // SECURITY: Require admin authentication
    const supabaseAuth = createSupabaseClientWithAuth(request)
    await requireAdmin(supabaseAuth)

    const { id } = await params

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

    const { data: translation, error } = await supabaseAdmin
      .from('about_stats_translations')
      .delete()
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error deleting translation:', error)
      return createAuthError('Failed to delete translation', 500)
    }

    if (!translation) {
      return createAuthError('Translation not found', 404)
    }

    return NextResponse.json({ translation })
  } catch (error) {
    console.error('Error in DELETE /api/about-stats-translations/[id]:', error)
    return createAuthError('Internal server error', 500)
  }
}