import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request) {
  try {
    // Test basic database connection
    const { data: testData, error: testError } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1)

    if (testError) {
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: testError.message
      })
    }

    // Test table structure
    const { data: columns, error: columnError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1)

    if (columnError) {
      return NextResponse.json({
        success: false,
        error: 'Table query failed',
        details: columnError.message
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      sampleColumns: columns ? Object.keys(columns[0] || {}) : [],
      testResult: testData
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error.message
    })
  }
}