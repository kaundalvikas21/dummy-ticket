import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale') || 'en'

    const { data: section, error } = await supabase
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
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching FAQ page section:', error)
      return NextResponse.json(
        { error: 'Failed to fetch FAQ page section', details: error.message },
        { status: 500 }
      )
    }

    if (!section) {
      return NextResponse.json(
        { error: 'FAQ page section not found' },
        { status: 404 }
      )
    }

    // Transform the data to include fallbacks
    const transformedSection = {
      id: section.id,
      title: section.faq_section_translations?.[0]?.title || section.title,
      icon: section.icon,
      status: section.status,
      sort_order: section.sort_order,
      items: (section.faq_page_items || [])
        .sort((a, b) => a.sort_order - b.sort_order)
        .map(item => ({
          id: item.id,
          question: item.faq_item_translations?.[0]?.question || item.question,
          answer: item.faq_item_translations?.[0]?.answer || item.answer,
          status: item.status,
          sort_order: item.sort_order
        }))
    }

    return NextResponse.json({ section: transformedSection })
  } catch (error) {
    console.error('Error in GET /api/faq-page/sections/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const { title, icon, status, sort_order } = await request.json()

    if (!title || title.trim() === '') {
      return NextResponse.json(
        { error: 'Section title is required' },
        { status: 400 }
      )
    }

    const updateData = {
      updated_at: new Date().toISOString()
    }

    if (title !== undefined && title !== null) {
      updateData.title = title.trim()
    }
    if (icon !== undefined) {
      updateData.icon = icon?.trim() || null
    }
    if (status !== undefined) {
      updateData.status = status
    }
    if (sort_order !== undefined) {
      updateData.sort_order = sort_order
    }

    const { data: sections, error } = await supabase
      .from('faq_page_sections')
      .update(updateData)
      .eq('id', id)
      .select()

    if (error) {
      console.error('Error updating FAQ page section:', error)
      return NextResponse.json(
        { error: 'Failed to update FAQ page section', details: error.message },
        { status: 500 }
      )
    }

    if (!sections || sections.length === 0) {
      return NextResponse.json(
        { error: 'FAQ page section not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ section: sections[0] })
  } catch (error) {
    console.error('Error in PUT /api/faq-page/sections/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params

    // First check if the section exists
    const { data: existingSection, error: checkError } = await supabase
      .from('faq_page_sections')
      .select('id, title')
      .eq('id', id)

    if (checkError) {
      console.error('Error checking existing section for deletion:', checkError)
      return NextResponse.json(
        { error: 'Failed to check section existence', details: checkError.message },
        { status: 500 }
      )
    }

    if (!existingSection || existingSection.length === 0) {
      return NextResponse.json(
        { error: 'FAQ page section not found', details: `No section found with ID: ${id}` },
        { status: 404 }
      )
    }

    // Delete the section (cascade delete will handle items and translations)
    const { data: deletedSection, error } = await supabase
      .from('faq_page_sections')
      .delete()
      .eq('id', id)
      .select()

    if (error) {
      console.error('Error deleting FAQ page section:', error)
      return NextResponse.json(
        { error: 'Failed to delete FAQ page section', details: error.message },
        { status: 500 }
      )
    }

    if (!deletedSection || deletedSection.length === 0) {
      console.error('FAQ page section deletion failed - no rows affected')
      return NextResponse.json(
        { error: 'FAQ page section deletion failed', details: 'No rows were deleted' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'FAQ page section deleted successfully',
      deletedSection: deletedSection[0]
    })
  } catch (error) {
    console.error('Error in DELETE /api/faq-page/sections/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}