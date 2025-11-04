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
    const { id } = params

    const { data: faq, error } = await supabase
      .from('faqs')
      .delete()
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error deleting FAQ:', error)
      return NextResponse.json(
        { error: 'Failed to delete FAQ' },
        { status: 500 }
      )
    }

    if (!faq) {
      return NextResponse.json(
        { error: 'FAQ not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'FAQ deleted successfully' })
  } catch (error) {
    console.error('Error in DELETE /api/faqs/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}