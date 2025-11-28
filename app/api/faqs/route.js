import { NextResponse } from 'next/server'
import {
  requireAdmin,
  createSupabaseClientWithAuth,
  createAuthError,
  validateInput
} from "@/lib/auth-helper"
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function GET(request) {
  try {
    // For public read access, use server client (RLS will handle filtering)
    const supabase = await createServerClient()
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale') || 'en'

    const { data: faqs, error } = await supabase
      .from('faqs')
      .select(`
        *,
        faq_translations!inner (
          question,
          answer,
          locale
        )
      `)
      .eq('status', 'active')
      .eq('faq_translations.locale', locale)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Error fetching FAQs:', error)
      return NextResponse.json(
        { error: 'Failed to fetch FAQs' },
        { status: 500 }
      )
    }

    // Transform the data to include fallbacks
    const transformedFaqs = faqs.map(faq => ({
      id: faq.id,
      question: faq.faq_translations[0]?.question || faq.question,
      answer: faq.faq_translations[0]?.answer || faq.answer,
      locale: faq.faq_translations[0]?.locale || 'en',
      fallback_question: faq.question,
      fallback_answer: faq.answer,
      status: faq.status,
      sort_order: faq.sort_order,
      created_at: faq.created_at,
      updated_at: faq.updated_at
    }))

    return NextResponse.json({ faqs: transformedFaqs })
  } catch (error) {
    console.error('Error in GET /api/faqs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    // SECURITY: Require admin authentication
    const supabase = createSupabaseClientWithAuth(request)
    await requireAdmin(supabase)

    // Validate input data
    const body = await request.json()
    validateInput(body, ['question', 'answer'])

    const { question, answer, status = 'active', sort_order } = body

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

    console.log('🔍 FAQ API: Admin authenticated, creating FAQ')

    // If sort_order is not provided, automatically assign the next available one
    let finalSortOrder = sort_order
    if (finalSortOrder === undefined || finalSortOrder === null) {
      const { data: maxSortData } = await supabaseAdmin
        .from('faqs')
        .select('sort_order')
        .order('sort_order', { ascending: false })
        .limit(1)
        .single()

      finalSortOrder = maxSortData ? maxSortData.sort_order + 1 : 0
    }

    console.log('📝 FAQ API: Attempting to create FAQ:', { question: question.trim(), status, sort_order: finalSortOrder })

    const { data: faq, error } = await supabaseAdmin
      .from('faqs')
      .insert([
        {
          question: question.trim(),
          answer: answer.trim(),
          status,
          sort_order: finalSortOrder
        }
      ])
      .select()
      .single()

    console.log('📝 FAQ API: Insert result:', { error, faq })

    if (error) {
      console.error('❌ FAQ API: Error creating FAQ:', error)
      return createAuthError('Failed to create FAQ', 500)
    }

    console.log('✅ FAQ API: FAQ created successfully:', faq)
    return NextResponse.json({ faq }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/faqs:', error)

    // Handle authentication errors specifically
    if (error.message.includes('Admin') || error.message.includes('Authentication')) {
      return createAuthError(error.message, 403)
    }

    return createAuthError('Internal server error', 500)
  }
}