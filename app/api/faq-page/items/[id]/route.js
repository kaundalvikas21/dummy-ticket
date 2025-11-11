import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale') || 'en'

    const { data: item, error } = await supabase
      .from('faq_page_items')
      .select(`
        *,
        faq_page_item_translations (
          locale,
          question,
          answer
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching FAQ page item:', error)
      return NextResponse.json(
        { error: 'Failed to fetch FAQ page item', details: error.message },
        { status: 500 }
      )
    }

    if (!item) {
      return NextResponse.json(
        { error: 'FAQ page item not found' },
        { status: 404 }
      )
    }

    // Transform the data to include fallbacks
    const transformedItem = {
      id: item.id,
      section_id: item.section_id,
      question: item.faq_item_translations?.[0]?.question || item.question,
      answer: item.faq_item_translations?.[0]?.answer || item.answer,
      status: item.status,
      sort_order: item.sort_order
    }

    return NextResponse.json({ item: transformedItem })
  } catch (error) {
    console.error('Error in GET /api/faq-page/items/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const { section_id, question, answer, status, sort_order } = await request.json()

    if (!question || !answer) {
      return NextResponse.json(
        { error: 'Question and answer are required' },
        { status: 400 }
      )
    }

    if (question.trim() === '' || answer.trim() === '') {
      return NextResponse.json(
        { error: 'Question and answer cannot be empty' },
        { status: 400 }
      )
    }

    const updateData = {
      updated_at: new Date().toISOString()
    }

    if (section_id !== undefined) {
      updateData.section_id = section_id
    }
    if (question !== undefined && question !== null) {
      updateData.question = question.trim()
    }
    if (answer !== undefined && answer !== null) {
      updateData.answer = answer.trim()
    }
    if (status !== undefined) {
      updateData.status = status
    }
    if (sort_order !== undefined) {
      updateData.sort_order = sort_order
    }

    const { data: items, error } = await supabase
      .from('faq_page_items')
      .update(updateData)
      .eq('id', id)
      .select()

    if (error) {
      console.error('Error updating FAQ page item:', error)
      return NextResponse.json(
        { error: 'Failed to update FAQ page item', details: error.message },
        { status: 500 }
      )
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'FAQ page item not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ item: items[0] })
  } catch (error) {
    console.error('Error in PUT /api/faq-page/items/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params

    // First check if the item exists
    const { data: existingItem, error: checkError } = await supabase
      .from('faq_page_items')
      .select('id, question')
      .eq('id', id)

    if (checkError) {
      console.error('Error checking existing item for deletion:', checkError)
      return NextResponse.json(
        { error: 'Failed to check item existence', details: checkError.message },
        { status: 500 }
      )
    }

    if (!existingItem || existingItem.length === 0) {
      return NextResponse.json(
        { error: 'FAQ page item not found', details: `No item found with ID: ${id}` },
        { status: 404 }
      )
    }

    // Delete the item (cascade delete will handle translations)
    const { data: deletedItem, error } = await supabase
      .from('faq_page_items')
      .delete()
      .eq('id', id)
      .select()

    if (error) {
      console.error('Error deleting FAQ page item:', error)
      return NextResponse.json(
        { error: 'Failed to delete FAQ page item', details: error.message },
        { status: 500 }
      )
    }

    if (!deletedItem || deletedItem.length === 0) {
      console.error('FAQ page item deletion failed - no rows affected')
      return NextResponse.json(
        { error: 'FAQ page item deletion failed', details: 'No rows were deleted' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'FAQ page item deleted successfully',
      deletedItem: deletedItem[0]
    })
  } catch (error) {
    console.error('Error in DELETE /api/faq-page/items/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}