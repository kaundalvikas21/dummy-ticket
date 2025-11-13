import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { label, value } = body

    // Validation
    if (!label) {
      return NextResponse.json(
        { error: 'Label is required' },
        { status: 400 }
      )
    }

    const { data: translation, error } = await supabase
      .from('about_stats_translations')
      .update({
        label,
        value,
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
    console.error('Error in PUT /api/about-stats-translations/[id]:', error)
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
      .from('about_stats_translations')
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

    return NextResponse.json({ translation })
  } catch (error) {
    console.error('Error in DELETE /api/about-stats-translations/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}