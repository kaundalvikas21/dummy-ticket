import { NextResponse } from 'next/server'
import {
  requireAdmin,
  createSupabaseClientWithAuth,
  createAuthError,
  validateInput
} from "@/lib/auth-helper"
import { createClient } from '@supabase/supabase-js'

export async function POST(request) {
  try {
    // SECURITY: Require admin authentication
    const supabase = createSupabaseClientWithAuth(request)
    await requireAdmin(supabase)

    // Validate input data
    const body = await request.json()
    validateInput(body, ['faq_id', 'locale', 'question', 'answer'])

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
      .insert([
        {
          faq_id,
          locale,
          question: question.trim(),
          answer: answer.trim()
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating translation:', error)
      return createAuthError('Failed to create translation', 500)
    }

    return NextResponse.json({ translation }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/faq-translations:', error)

    // Handle authentication errors specifically
    if (error.message.includes('Admin') || error.message.includes('Authentication')) {
      return createAuthError(error.message, 403)
    }

    return createAuthError('Internal server error', 500)
  }
}

export async function PUT(request) {
  try {
    // SECURITY: Require admin authentication
    const supabase = createSupabaseClientWithAuth(request)
    await requireAdmin(supabase)

    // Validate input data
    const body = await request.json()
    validateInput(body, ['id', 'faq_id', 'locale', 'question', 'answer'])

    const { id, faq_id, locale, question, answer } = body

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

    return NextResponse.json({ translation })
  } catch (error) {
    console.error('Error in PUT /api/faq-translations:', error)

    // Handle authentication errors specifically
    if (error.message.includes('Admin') || error.message.includes('Authentication')) {
      return createAuthError(error.message, 403)
    }

    return createAuthError('Internal server error', 500)
  }
}

export async function DELETE(request) {
  try {
    // SECURITY: Require admin authentication
    const supabase = createSupabaseClientWithAuth(request)
    await requireAdmin(supabase)

    // Get translation ID from URL or body
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id') || (await request.json()).id

    if (!id) {
      return createAuthError('Translation ID is required', 400)
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

    const { error } = await supabaseAdmin
      .from('faq_translations')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting translation:', error)
      return createAuthError('Failed to delete translation', 500)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/faq-translations:', error)

    // Handle authentication errors specifically
    if (error.message.includes('Admin') || error.message.includes('Authentication')) {
      return createAuthError(error.message, 403)
    }

    return createAuthError('Internal server error', 500)
  }
}

// GET method for authenticated users (RLS will handle access control)
export async function GET(request) {
  try {
    // SECURITY: Require basic authentication (RLS will handle access control)
    const supabase = createSupabaseClientWithAuth(request)

    const { searchParams } = new URL(request.url)
    const faq_id = searchParams.get('faq_id')
    const locale = searchParams.get('locale')

    let query = supabase.from('faq_translations').select('*')

    if (faq_id) {
      query = query.eq('faq_id', faq_id)
    }

    if (locale) {
      query = query.eq('locale', locale)
    }

    const { data: translations, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching translations:', error)
      return createAuthError('Failed to fetch translations', 500)
    }

    return NextResponse.json({ translations })
  } catch (error) {
    console.error('Error in GET /api/faq-translations:', error)
    return createAuthError('Internal server error', 500)
  }
}