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

    // Validate input data
    const body = await request.json()
    validateInput(body, ['question', 'answer'])

    const { question, answer, status, sort_order } = body

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

    const { data: faq, error } = await supabaseAdmin
      .from('faqs')
      .update({
        question: question.trim(),
        answer: answer.trim(),
        status: status || 'active',
        sort_order: sort_order || 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating FAQ:', error)
      return createAuthError('Failed to update FAQ', 500)
    }

    if (!faq) {
      return createAuthError('FAQ not found', 404)
    }

    return NextResponse.json({ faq })
  } catch (error) {
    console.error('Error in PUT /api/faqs/[id]:', error)

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

    console.log('DELETE FAQ - ID:', id)

    // First check if the FAQ exists
    const { data: existingFaq, error: checkError } = await supabaseAdmin
      .from('faqs')
      .select('id, question, answer, status')
      .eq('id', id)

    console.log('DELETE FAQ - Existing FAQ check:', { existingFaq, checkError })

    if (checkError) {
      console.error('Error checking existing FAQ for deletion:', checkError)
      return createAuthError('Failed to check FAQ existence', 500)
    }

    if (!existingFaq || existingFaq.length === 0) {
      console.error('FAQ not found for deletion with ID:', id)
      return createAuthError('FAQ not found', 404)
    }

    // Delete the FAQ (cascade delete should handle translations if properly set up)
    const { data: deletedFaq, error } = await supabaseAdmin
      .from('faqs')
      .delete()
      .eq('id', id)
      .select()

    console.log('DELETE FAQ - Delete result:', { deletedFaq, error })

    if (error) {
      console.error('Error deleting FAQ:', error)
      return createAuthError('Failed to delete FAQ', 500)
    }

    if (!deletedFaq || deletedFaq.length === 0) {
      console.error('FAQ deletion failed - no rows affected')
      return createAuthError('FAQ deletion failed - no rows were affected', 500)
    }

    console.log('FAQ deleted successfully:', deletedFaq[0])
    return NextResponse.json({
      message: 'FAQ deleted successfully',
      deletedFaq: deletedFaq[0]
    })
  } catch (error) {
    console.error('Error in DELETE /api/faqs/[id]:', error)

    // Handle authentication errors specifically
    if (error.message.includes('Admin') || error.message.includes('Authentication')) {
      return createAuthError(error.message, 403)
    }

    return createAuthError('Internal server error', 500)
  }
}