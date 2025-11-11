import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Use service role to bypass RLS for testing
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function GET(request) {
  try {
    console.log('Testing contact_submissions table access...')

    // Test 1: Check if table exists
    const { data: testResult, error: tableError } = await supabaseAdmin
      .from('contact_submissions')
      .select('count')
      .single()

    console.log('Table test result:', { testResult, tableError })

    if (tableError) {
      return NextResponse.json({
        error: 'Table access error',
        details: tableError.message,
        hint: 'Table may not exist or migration not applied'
      }, { status: 500 })
    }

    // Test 2: Get actual submissions
    const { data: submissions, error: submissionsError } = await supabaseAdmin
      .from('contact_submissions')
      .select('*')
      .limit(5)
      .order('created_at', { ascending: false })

    console.log('Submissions result:', { submissions, submissionsError })

    if (submissionsError) {
      return NextResponse.json({
        error: 'Submissions query error',
        details: submissionsError.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Table exists and has data',
      count: testResult?.count || 0,
      submissions: submissions || [],
      hasData: submissions && submissions.length > 0
    })

  } catch (error) {
    console.error('Test endpoint error:', error)
    return NextResponse.json({
      error: 'Unexpected error',
      details: error.message
    }, { status: 500 })
  }
}