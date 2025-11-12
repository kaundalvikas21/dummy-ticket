import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { data: stats, error } = await supabase
      .from('about_stats')
      .select('*')
      .eq('status', 'active')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching about stats:', error)
      return NextResponse.json(
        { error: 'Failed to fetch about stats' },
        { status: 500 }
      )
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Error in GET /api/about/stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { icon, value, label, status = 'active', sort_order = 1 } = body

    // Validation
    if (!icon || !value || !label) {
      return NextResponse.json(
        { error: 'Icon, value, and label are required' },
        { status: 400 }
      )
    }

    const { data: stat, error } = await supabase
      .from('about_stats')
      .insert([
        {
          icon,
          value,
          label,
          status,
          sort_order
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating about stat:', error)
      return NextResponse.json(
        { error: 'Failed to create about stat' },
        { status: 500 }
      )
    }

    return NextResponse.json({ stat }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/about/stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}