import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { title, content, content_type, status, sort_order } = body

    // Validation
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    const { data: ticket, error } = await supabase
      .from('about_dummy_tickets')
      .update({
        title,
        content,
        content_type,
        status,
        sort_order,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating dummy ticket:', error)
      return NextResponse.json(
        { error: 'Failed to update dummy ticket' },
        { status: 500 }
      )
    }

    if (!ticket) {
      return NextResponse.json(
        { error: 'Dummy ticket not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ ticket })
  } catch (error) {
    console.error('Error in PUT /api/about/dummy-tickets/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params

    const { data: ticket, error } = await supabase
      .from('about_dummy_tickets')
      .delete()
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error deleting dummy ticket:', error)
      return NextResponse.json(
        { error: 'Failed to delete dummy ticket' },
        { status: 500 }
      )
    }

    if (!ticket) {
      return NextResponse.json(
        { error: 'Dummy ticket not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ ticket })
  } catch (error) {
    console.error('Error in DELETE /api/about/dummy-tickets/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}