import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { icon, value, label, status, sort_order } = body

    // Validation
    if (!icon || !value || !label) {
      return NextResponse.json(
        { error: 'Icon, value, and label are required' },
        { status: 400 }
      )
    }

    const { data: stat, error } = await supabase
      .from('about_stats')
      .update({
        icon,
        value,
        label,
        status,
        sort_order,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating about stat:', error)
      return NextResponse.json(
        { error: 'Failed to update about stat' },
        { status: 500 }
      )
    }

    if (!stat) {
      return NextResponse.json(
        { error: 'About stat not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ stat })
  } catch (error) {
    console.error('Error in PUT /api/about/stats/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params

    const { data: stat, error } = await supabase
      .from('about_stats')
      .delete()
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error deleting about stat:', error)
      return NextResponse.json(
        { error: 'Failed to delete about stat' },
        { status: 500 }
      )
    }

    if (!stat) {
      return NextResponse.json(
        { error: 'About stat not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ stat })
  } catch (error) {
    console.error('Error in DELETE /api/about/stats/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}