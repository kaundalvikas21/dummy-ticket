import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const { faq_id, locale, question, answer } = await request.json()

    if (!question || !answer) {
      return NextResponse.json(
        { error: 'Question and answer are required' },
        { status: 400 }
      )
    }

    const { data: translation, error } = await supabase
      .from('faq_translations')
      .update({
        faq_id: faq_id || undefined,
        locale: locale || undefined,
        question: question.trim(),
        answer: answer.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating translation:', error)
      return NextResponse.json(
        { error: 'Failed to update translation' },
        { status: 500 }
      )
    }

    if (!translation) {
      return NextResponse.json(
        { error: 'Translation not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ translation })
  } catch (error) {
    console.error('Error in PUT /api/faq-translations/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params

    const { data: translation, error } = await supabase
      .from('faq_translations')
      .delete()
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error deleting translation:', error)
      return NextResponse.json(
        { error: 'Failed to delete translation' },
        { status: 500 }
      )
    }

    if (!translation) {
      return NextResponse.json(
        { error: 'Translation not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Translation deleted successfully' })
  } catch (error) {
    console.error('Error in DELETE /api/faq-translations/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}