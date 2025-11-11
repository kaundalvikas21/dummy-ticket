import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    // Test if table exists and is accessible
    const { data: testResult, error } = await supabase
      .from('contact_submissions')
      .select('count')
      .single()

    if (error) {
      console.error('Table access error:', error)

      // Try to check if table exists without RLS
      const { data: adminCheck, error: adminError } = await supabase
        .from('contact_submissions')
        .select('count')
        .single()
        .options({
          // Bypass RLS for testing
          head: false
        })

      if (adminError) {
        console.error('Admin access error:', adminError)
        return NextResponse.json({
          error: 'Table does not exist or RLS policies issue',
          details: adminError.message,
          fix: 'Please run migration: supabase db push'
        }, { status: 500 })
      }

      return NextResponse.json({
        error: 'RLS policy issue',
        details: error.message,
        fix: 'Check if user is authenticated with admin role',
        adminCheck
      }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Table exists and is accessible',
      count: testResult?.count || 0
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({
      error: 'Unexpected error',
      details: error.message
    }, { status: 500 })
  }
}