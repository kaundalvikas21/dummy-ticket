import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const offset = (page - 1) * limit

    // Build query
    let query = supabase
      .from('contact_submissions')
      .select(`
        *,
        admin:admin_id (
          id,
          email,
          name
        )
      `, { count: 'exact' })

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }
    if (priority && priority !== 'all') {
      query = query.eq('priority', priority)
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,subject.ilike.%${search}%`)
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: submissions, error, count } = await query

    if (error) {
      console.error('Error fetching contact submissions:', error)
      return NextResponse.json(
        { error: 'Failed to fetch contact submissions' },
        { status: 500 }
      )
    }

    // Calculate pagination info
    const totalPages = Math.ceil((count || 0) / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      submissions: submissions || [],
      pagination: {
        currentPage: page,
        totalPages,
        totalCount: count || 0,
        limit,
        hasNextPage,
        hasPrevPage
      }
    })

  } catch (error) {
    console.error('Error in GET /api/contact/submissions:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(request) {
  try {
    const { id, status, admin_notes, admin_id } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'Submission ID is required' },
        { status: 400 }
      )
    }

    // Validate status
    const validStatuses = ['pending', 'in_progress', 'resolved', 'closed']
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      )
    }

    // Build update object
    const updateData = {
      updated_at: new Date().toISOString()
    }

    if (status !== undefined) updateData.status = status
    if (admin_notes !== undefined) updateData.admin_notes = admin_notes
    if (admin_id !== undefined) updateData.admin_id = admin_id

    const { data: submission, error } = await supabase
      .from('contact_submissions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating contact submission:', error)
      return NextResponse.json(
        { error: 'Failed to update contact submission', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      submission,
      message: 'Contact submission updated successfully'
    })

  } catch (error) {
    console.error('Error in PUT /api/contact/submissions:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Submission ID is required for deletion' },
        { status: 400 }
      )
    }

    const { data: deletedSubmission, error } = await supabase
      .from('contact_submissions')
      .delete()
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error deleting contact submission:', error)
      return NextResponse.json(
        { error: 'Failed to delete contact submission', details: error.message },
        { status: 500 }
      )
    }

    if (!deletedSubmission) {
      return NextResponse.json(
        { error: 'Contact submission not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Contact submission deleted successfully',
      deletedSubmission
    })

  } catch (error) {
    console.error('Error in DELETE /api/contact/submissions:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}