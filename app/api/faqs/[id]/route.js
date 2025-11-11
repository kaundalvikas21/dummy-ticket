import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const { question, answer, status, sort_order } = await request.json()

    if (!question || !answer) {
      return NextResponse.json(
        { error: 'Question and answer are required' },
        { status: 400 }
      )
    }

    const { data: faq, error } = await supabase
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
      return NextResponse.json(
        { error: 'Failed to update FAQ' },
        { status: 500 }
      )
    }

    if (!faq) {
      return NextResponse.json(
        { error: 'FAQ not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ faq })
  } catch (error) {
    console.error('Error in PUT /api/faqs/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params

    console.log('DELETE FAQ - ID:', id)

    // First check if the FAQ exists
    const { data: existingFaq, error: checkError } = await supabase
      .from('faqs')
      .select('id, question, answer, status')
      .eq('id', id)

    console.log('DELETE FAQ - Existing FAQ check:', { existingFaq, checkError })

    if (checkError) {
      console.error('Error checking existing FAQ for deletion:', checkError)
      return NextResponse.json(
        { error: 'Failed to check FAQ existence', details: checkError.message },
        { status: 500 }
      )
    }

    if (!existingFaq || existingFaq.length === 0) {
      console.error('FAQ not found for deletion with ID:', id)
      return NextResponse.json(
        { error: 'FAQ not found', details: `No FAQ found with ID: ${id}` },
        { status: 404 }
      )
    }

    // Delete the FAQ (cascade delete should handle translations if properly set up)
    const { data: deletedFaq, error } = await supabase
      .from('faqs')
      .delete()
      .eq('id', id)
      .select()

    console.log('DELETE FAQ - Delete result:', { deletedFaq, error })

    if (error) {
      console.error('Error deleting FAQ:', error)
      return NextResponse.json(
        { error: 'Failed to delete FAQ', details: error.message },
        { status: 500 }
      )
    }

    if (!deletedFaq || deletedFaq.length === 0) {
      console.error('FAQ deletion failed - no rows affected')
      return NextResponse.json(
        { error: 'FAQ deletion failed', details: 'No rows were deleted' },
        { status: 500 }
      )
    }

    console.log('FAQ deleted successfully:', deletedFaq[0])
    return NextResponse.json({
      message: 'FAQ deleted successfully',
      deletedFaq: deletedFaq[0]
    })
  } catch (error) {
    console.error('Error in DELETE /api/faqs/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}