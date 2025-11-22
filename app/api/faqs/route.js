import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const supabase = await createClient()
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
    const supabase = await createClient()
    const { question, answer, status = 'active', sort_order } = await request.json()

    if (!question || !answer) {
      return NextResponse.json(
        { error: 'Question and answer are required' },
        { status: 400 }
      )
    }

    // Verify user is admin using server-side auth
    console.log('🔍 FAQ API: Getting user for authentication')
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    console.log('📝 FAQ API: Auth result:', { authError, user: user?.id })

    if (authError || !user) {
      console.log('❌ FAQ API: Authentication failed:', authError?.message)
      return NextResponse.json(
        { error: 'Authentication required', details: authError?.message },
        { status: 401 }
      )
    }

    console.log('✅ FAQ API: User authenticated:', user.id)

    // If sort_order is not provided, automatically assign the next available one
    let finalSortOrder = sort_order
    if (finalSortOrder === undefined || finalSortOrder === null) {
      const { data: maxSortData } = await supabase
        .from('faqs')
        .select('sort_order')
        .order('sort_order', { ascending: false })
        .limit(1)
        .single()

      finalSortOrder = maxSortData ? maxSortData.sort_order + 1 : 0
    }

    console.log('📝 FAQ API: Attempting to create FAQ:', { question: question.trim(), status, sort_order: finalSortOrder })

    const { data: faq, error } = await supabase
      .from('faqs')
      .insert([
        {
          question: question.trim(),
          answer: answer.trim(),
          status,
          sort_order: finalSortOrder,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single()

    console.log('📝 FAQ API: Insert result:', { error, faq })

    if (error) {
      console.error('❌ FAQ API: Error creating FAQ:', error)
      return NextResponse.json(
        { error: 'Failed to create FAQ', details: error.message, code: error.code },
        { status: 500 }
      )
    }

    console.log('✅ FAQ API: FAQ created successfully:', faq)
    return NextResponse.json({ faq }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/faqs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}