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
    const supabase = createSupabaseClientWithAuth(request)
    await requireAdmin(supabase)

    const { id } = await params

    // Validate input data - note: id comes from URL params, not body
    const body = await request.json()
    validateInput(body, ['question', 'answer'])

    const { faq_id, locale, question, answer } = body

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
      .from('faq_translations')
      .update({
        faq_id: faq_id || undefined,
        locale: locale || undefined,
        question: question.trim(),
        answer: answer.trim(),
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
    console.error('Error in PUT /api/faq-translations/[id]:', error)

    // Handle authentication errors specifically
    if (error.message.includes('Admin') || error.message.includes('Authentication')) {
      return createAuthError(error.message, 403)
    }

    return createAuthError('Internal server error', 500)
  }
}

export async function DELETE(request, { params }) {
  try {
    // SECURITY: Require admin authentication
    const supabase = createSupabaseClientWithAuth(request)
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

    const { data: translation, error } = await supabaseAdmin
      .from('faq_translations')
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

    return NextResponse.json({ message: 'Translation deleted successfully' })
  } catch (error) {
    console.error('Error in DELETE /api/faq-translations/[id]:', error)

    // Handle authentication errors specifically
    if (error.message.includes('Admin') || error.message.includes('Authentication')) {
      return createAuthError(error.message, 403)
    }

    return createAuthError('Internal server error', 500)
  }
}