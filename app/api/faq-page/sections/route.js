import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import {
  requireAdmin,
  createSupabaseClientWithAuth,
  createAuthError
} from "@/lib/auth-helper"

// Helper functions to get localized content
function getLocalizedTitle(section, locale) {
  const translation = section.faq_page_section_translations?.find(t => t.locale === locale)
  return translation?.title || section.title
}

function getLocalizedQuestion(item, locale) {
  const translation = item.faq_page_item_translations?.find(t => t.locale === locale)
  return translation?.question || item.question
}

function getLocalizedAnswer(item, locale) {
  const translation = item.faq_page_item_translations?.find(t => t.locale === locale)
  return translation?.answer || item.answer
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale') || 'en'
    const includeInactive = searchParams.get('include_inactive') === 'true'

    // Use admin authentication if requesting inactive sections
    let supabaseClient = supabase
    if (includeInactive) {
      supabaseClient = createSupabaseClientWithAuth(request)
      await requireAdmin(supabaseClient)
    }

    // Get sections with their items and translations
    let query = supabaseClient
      .from('faq_page_sections')
      .select(`
        *,
        faq_page_section_translations (
          locale,
          title
        ),
        faq_page_items (
          id,
          question,
          answer,
          status,
          sort_order,
          faq_page_item_translations (
            locale,
            question,
            answer
          )
        )
      `)
      .order('sort_order', { ascending: true })

    if (!includeInactive) {
      query = query.eq('status', 'active')
    }

    const { data: sections, error } = await query

    if (error) {
      console.error('Error fetching FAQ page sections:', error)
      return NextResponse.json(
        { error: 'Failed to fetch FAQ page sections' },
        { status: 500 }
      )
    }

    // Transform the data to include fallbacks, localized content, and raw translation data
    const transformedSections = sections.map(section => ({
      id: section.id,
      title: getLocalizedTitle(section, locale),
      icon: section.icon,
      status: section.status,
      sort_order: section.sort_order,
      // Include raw translation data for editing
      section_translations: section.faq_page_section_translations || [],
      items: (section.faq_page_items || [])
        .filter(item => includeInactive || item.status === 'active')
        .sort((a, b) => a.sort_order - b.sort_order)
        .map(item => ({
          id: item.id,
          question: getLocalizedQuestion(item, locale),
          answer: getLocalizedAnswer(item, locale),
          status: item.status,
          sort_order: item.sort_order,
          // Include raw translation data for editing
          item_translations: item.faq_page_item_translations || []
        }))
    }))

    return NextResponse.json({ sections: transformedSections })
  } catch (error) {
    console.error('Error in GET /api/faq-page/sections:', error)

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

    const { title, icon, status = 'active', sort_order } = await request.json()

    if (!title || title.trim() === '') {
      return NextResponse.json(
        { error: 'Section title is required' },
        { status: 400 }
      )
    }

    // If sort_order is not provided, automatically assign the next available one
    let finalSortOrder = sort_order
    if (finalSortOrder === undefined || finalSortOrder === null) {
      const { data: maxSortData } = await supabase
        .from('faq_page_sections')
        .select('sort_order')
        .order('sort_order', { ascending: false })
        .limit(1)
        .single()

      finalSortOrder = maxSortData ? maxSortData.sort_order + 1 : 0
    }

    const { data: section, error } = await supabase
      .from('faq_page_sections')
      .insert([
        {
          title: title.trim(),
          icon: icon?.trim() || null,
          status,
          sort_order: finalSortOrder,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating FAQ page section:', error)
      return NextResponse.json(
        { error: 'Failed to create FAQ page section', details: error.message },
        { status: 500 }
      )
    }

    // Create English translation entry (same as default content)
    const { data: englishTranslation, error: translationError } = await supabase
      .from('faq_page_section_translations')
      .insert([
        {
          section_id: section.id,
          locale: 'en',
          title: section.title, // Use the same title as the default
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (translationError) {
      console.error('Error creating English section translation:', translationError)
      // Continue even if translation creation fails, but log the error
    }

    return NextResponse.json({ section }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/faq-page/sections:', error)

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