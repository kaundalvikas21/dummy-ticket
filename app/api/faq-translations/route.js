import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { faq_id, locale, question, answer } = await request.json()

    if (!faq_id || !locale || !question || !answer) {
      return NextResponse.json(
        { error: 'FAQ ID, locale, question, and answer are required' },
        { status: 400 }
      )
    }

    const { data: translation, error } = await supabase
      .from('faq_translations')
      .insert([
        {
          faq_id,
          locale,
          question: question.trim(),
          answer: answer.trim(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating translation:', error)
      return NextResponse.json(
        { error: 'Failed to create translation' },
        { status: 500 }
      )
    }

    return NextResponse.json({ translation }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/faq-translations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}