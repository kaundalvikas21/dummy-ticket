import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import {
  requireAdmin,
  createSupabaseClientWithAuth,
  createAuthError
} from "@/lib/auth-helper"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const sectionId = searchParams.get('section_id')
    const locale = searchParams.get('locale') || 'en'
    const includeInactive = searchParams.get('include_inactive') === 'true'

    // Use admin authentication if requesting inactive items
    let supabaseClient = supabase
    if (includeInactive) {
      supabaseClient = createSupabaseClientWithAuth(request)
      await requireAdmin(supabaseClient)
    }

    let query = supabaseClient
      .from('faq_page_items')
      .select(`
        *,
        faq_page_item_translations (
          locale,
          question,
          answer
        )
      `)
      .order('sort_order', { ascending: true })

    if (sectionId) {
      query = query.eq('section_id', sectionId)
    }

    if (!includeInactive) {
      query = query.eq('status', 'active')
    }

    const { data: items, error } = await query

    if (error) {
      console.error('Error fetching FAQ page items:', error)
      return NextResponse.json(
        { error: 'Failed to fetch FAQ page items' },
        { status: 500 }
      )
    }

    // Transform the data to include fallbacks
    const transformedItems = items.map(item => ({
      id: item.id,
      section_id: item.section_id,
      question: item.faq_page_item_translations?.[0]?.question || item.question,
      answer: item.faq_page_item_translations?.[0]?.answer || item.answer,
      status: item.status,
      sort_order: item.sort_order
    }))

    return NextResponse.json({ items: transformedItems })
  } catch (error) {
    console.error('Error in GET /api/faq-page/items:', error)

    // Handle authentication errors specifically
    if (error.message.includes('Authentication') || error.message.includes('Admin')) {
      return createAuthError(error.message, 401)
    }

    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    // Check admin authentication using Supabase
    const supabase = createSupabaseClientWithAuth(request)
    await requireAdmin(supabase)

    const { section_id, question, answer, status = 'active', sort_order } = await request.json()

    if (!section_id || !question || !answer) {
      return NextResponse.json(
        { error: 'Section ID, question, and answer are required' },
        { status: 400 }
      )
    }

    if (question.trim() === '' || answer.trim() === '') {
      return NextResponse.json(
        { error: 'Question and answer cannot be empty' },
        { status: 400 }
      )
    }

    // If sort_order is not provided, automatically assign the next available one for this section
    let finalSortOrder = sort_order
    if (finalSortOrder === undefined || finalSortOrder === null) {
      const { data: maxSortData } = await supabase
        .from('faq_page_items')
        .select('sort_order')
        .eq('section_id', section_id)
        .order('sort_order', { ascending: false })
        .limit(1)
        .single()

      finalSortOrder = maxSortData ? maxSortData.sort_order + 1 : 0
    }

    const { data: item, error } = await supabase
      .from('faq_page_items')
      .insert([
        {
          section_id,
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

    if (error) {
      console.error('Error creating FAQ page item:', error)
      return NextResponse.json(
        { error: 'Failed to create FAQ page item', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ item }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/faq-page/items:', error)

    // Handle authentication errors specifically
    if (error.message.includes('Authentication') || error.message.includes('Admin')) {
      return createAuthError(error.message, 401)
    }

    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}