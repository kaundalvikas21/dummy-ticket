import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { data: stats, error } = await supabase
      .from('about_stats')
      .select('*')
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
    console.error('Error in GET /api/about/stats/admin:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}