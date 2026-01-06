import { NextResponse } from 'next/server'
import {
  requireAdmin,
  createSupabaseClientWithAuth,
  createAuthError,
  validateInput
} from "@/lib/auth-helper"
import { createClient } from '@supabase/supabase-js'

export async function PUT(request, { params }) {
  try {
    // SECURITY: Require admin authentication
    const supabase = await createSupabaseClientWithAuth()
    await requireAdmin(supabase)

    const { id } = await params
    const body = await request.json()
    const { icon, value, label, status, sort_order } = body

    // Validation
    if (!icon || !value || !label) {
      return createAuthError('Icon, value, and label are required', 400)
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

    const { data: stat, error } = await supabaseAdmin
      .from('about_stats')
      .update({
        icon,
        value,
        label,
        status,
        sort_order,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating about stat:', error)
      return createAuthError('Failed to update about stat', 500)
    }

    if (!stat) {
      return createAuthError('About stat not found', 404)
    }

    return NextResponse.json({ stat })
  } catch (error) {
    console.error('Error in PUT /api/about/stats/[id]:', error)
    return createAuthError('Internal server error', 500)
  }
}

export async function DELETE(request, { params }) {
  try {
    // SECURITY: Require admin authentication
    const supabase = await createSupabaseClientWithAuth()
    await requireAdmin(supabase)

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

    const { data: stat, error } = await supabaseAdmin
      .from('about_stats')
      .delete()
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error deleting about stat:', error)
      return createAuthError('Failed to delete about stat', 500)
    }

    if (!stat) {
      return createAuthError('About stat not found', 404)
    }

    return NextResponse.json({ stat })
  } catch (error) {
    console.error('Error in DELETE /api/about/stats/[id]:', error)
    return createAuthError('Internal server error', 500)
  }
}