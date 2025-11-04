import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { data: faqs, error } = await supabase
      .from('faqs')
      .select('*')
      .eq('status', 'active')
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Error fetching FAQs:', error)
      return NextResponse.json(
        { error: 'Failed to fetch FAQs' },
        { status: 500 }
      )
    }

    return NextResponse.json({ faqs })
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
    const { question, answer, status = 'active', sort_order = 0 } = await request.json()

    if (!question || !answer) {
      return NextResponse.json(
        { error: 'Question and answer are required' },
        { status: 400 }
      )
    }

    const { data: faq, error } = await supabase
      .from('faqs')
      .insert([
        {
          question: question.trim(),
          answer: answer.trim(),
          status,
          sort_order,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating FAQ:', error)
      return NextResponse.json(
        { error: 'Failed to create FAQ' },
        { status: 500 }
      )
    }

    return NextResponse.json({ faq }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/faqs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}