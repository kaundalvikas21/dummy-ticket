import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('Testing Supabase storage configuration...')

    // Test 1: Check if avatars bucket exists
    let bucketExists = false
    let bucketError = null

    try {
      const { data, error } = await supabase.storage.getBucket('avatars')
      bucketExists = !error
      bucketError = error
      console.log('Bucket check result:', { data, error })
    } catch (err) {
      bucketError = err.message
      console.error('Bucket check failed:', err)
    }

    // Test 2: Try to list files in avatars bucket
    let filesAccessible = false
    let filesError = null

    try {
      const { data, error } = await supabase.storage
        .from('avatars')
        .list('', { limit: 1 })
      filesAccessible = !error
      filesError = error
      console.log('Files list result:', { data, error })
    } catch (err) {
      filesError = err.message
      console.error('Files list failed:', err)
    }

    // Test 3: Check environment variables
    const envCheck = {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      supabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    }

    return NextResponse.json({
      success: true,
      checks: {
        bucket: {
          exists: bucketExists,
          error: bucketError?.message || bucketError,
          name: 'avatars'
        },
        files: {
          accessible: filesAccessible,
          error: filesError?.message || filesError
        },
        environment: envCheck
      },
      recommendations: []
    })

  } catch (error) {
    console.error('Storage check error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      checks: null
    }, { status: 500 })
  }
}