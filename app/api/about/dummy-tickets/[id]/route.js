import { supabase } from '@/lib/supabase'
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
    const { title, content, content_type, status, sort_order } = body

    // Validation
    if (!title || !content) {
      return createAuthError('Title and content are required', 400)
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

    const { data: ticket, error } = await supabaseAdmin
      .from('about_dummy_tickets')
      .update({
        title,
        content,
        content_type,
        status,
        sort_order,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating dummy ticket:', error)
      return createAuthError('Failed to update dummy ticket', 500)
    }

    if (!ticket) {
      return createAuthError('Dummy ticket not found', 404)
    }

    return NextResponse.json({ ticket })
  } catch (error) {
    console.error('Error in PUT /api/about/dummy-tickets/[id]:', error)
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

    const { data: ticket, error } = await supabaseAdmin
      .from('about_dummy_tickets')
      .delete()
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error deleting dummy ticket:', error)
      return createAuthError('Failed to delete dummy ticket', 500)
    }

    if (!ticket) {
      return createAuthError('Dummy ticket not found', 404)
    }

    return NextResponse.json({ ticket })
  } catch (error) {
    console.error('Error in DELETE /api/about/dummy-tickets/[id]:', error)
    return createAuthError('Internal server error', 500)
  }
}