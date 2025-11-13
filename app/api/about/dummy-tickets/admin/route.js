import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { data: tickets, error } = await supabase
      .from('about_dummy_tickets')
      .select(`
        *,
        about_dummy_tickets_translations (
          id,
          locale,
          title,
          content,
          created_at,
          updated_at
        )
      `)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Error fetching dummy tickets:', error)
      return NextResponse.json(
        { error: 'Failed to fetch dummy tickets' },
        { status: 500 }
      )
    }

    return NextResponse.json({ tickets })
  } catch (error) {
    console.error('Error in GET /api/about/dummy-tickets/admin:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}