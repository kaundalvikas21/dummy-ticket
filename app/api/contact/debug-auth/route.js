import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request) {
  try {
    // Check current user
    const supabaseWithAuth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Get auth user
    const { data: { user }, error: authError } = await supabaseWithAuth.auth.getUser()

    if (authError) {
      return NextResponse.json({
        error: 'Auth error',
        details: authError.message
      }, { status: 500 })
    }

    if (!user) {
      return NextResponse.json({
        error: 'No authenticated user found',
        fix: 'Please log in first'
      }, { status: 401 })
    }

    // Check if user exists in users table with admin role
    const { data: userRecord, error: userError } = await supabaseWithAuth
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (userError) {
      return NextResponse.json({
        error: 'User record not found',
        details: userError.message,
        authUserId: user.id,
        fix: 'Make sure you have a record in the users table with role = admin'
      }, { status: 400 })
    }

    // Test contact submissions access
    const { data: submissions, error: submissionsError } = await supabaseWithAuth
      .from('contact_submissions')
      .select('count')
      .single()

    return NextResponse.json({
      authUser: {
        id: user.id,
        email: user.email,
        role: userRecord?.role || 'not_found'
      },
      submissionsAccess: {
        success: !submissionsError,
        error: submissionsError?.message,
        count: submissions?.count || 0
      },
      message: submissionsError ? 'RLS policy blocking access' : 'Access granted'
    })

  } catch (error) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json({
      error: 'Debug endpoint error',
      details: error.message
    }, { status: 500 })
  }
}