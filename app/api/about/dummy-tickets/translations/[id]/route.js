import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'
import {
  requireAdmin,
  createSupabaseClientWithAuth,
  createAuthError
} from "@/lib/auth-helper"

export async function GET(request, { params }) {
  try {
    const { id } = await params
    
    const { data: translation, error } = await supabase
      .from('about_dummy_tickets_translations')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return new Response(JSON.stringify({ error: 'Translation not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        })
      }
      throw error
    }

    return Response.json({ translation })
  } catch (error) {
    console.error('Error in GET /api/about/dummy-tickets/translations/[id]:', error)
    return new Response(JSON.stringify({
      error: 'Failed to fetch translation',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params
        const body = await request.json()

    // Validate required fields
    const { ticket_id, locale, title, content } = body
    if (!ticket_id || !locale || !title || !content) {
      return new Response(JSON.stringify({
        error: 'Missing required fields: ticket_id, locale, title, content'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Verify translation exists
    const { data: existingTranslation, error: fetchError } = await supabase
      .from('about_dummy_tickets_translations')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return new Response(JSON.stringify({ error: 'Translation not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        })
      }
      throw fetchError
    }

    // Check if another translation exists for this ticket_id and locale combination
    const { data: duplicateCheck, error: duplicateError } = await supabase
      .from('about_dummy_tickets_translations')
      .select('id')
      .eq('ticket_id', ticket_id)
      .eq('locale', locale)
      .neq('id', id)
      .single()

    if (duplicateCheck) {
      return new Response(JSON.stringify({
        error: 'Translation already exists for this ticket and locale'
      }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Update translation
    const { data: translation, error } = await supabase
      .from('about_dummy_tickets_translations')
      .update({
        ticket_id,
        locale,
        title,
        content,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return Response.json({ translation })
  } catch (error) {
    console.error('Error in PUT /api/about/dummy-tickets/translations/[id]:', error)
    return new Response(JSON.stringify({
      error: 'Failed to update translation',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
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

    // Verify translation exists before deleting
    const { data: existingTranslation, error: fetchError } = await supabaseAdmin
      .from('about_dummy_tickets_translations')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return createAuthError('Translation not found', 404)
      }
      throw fetchError
    }

    // Delete translation
    const { error } = await supabaseAdmin
      .from('about_dummy_tickets_translations')
      .delete()
      .eq('id', id)

    if (error) throw error

    return Response.json({
      message: 'Translation deleted successfully',
      deletedId: id
    })
  } catch (error) {
    console.error('Error in DELETE /api/about/dummy-tickets/translations/[id]:', error)
    return createAuthError('Failed to delete translation', 500)
  }
}