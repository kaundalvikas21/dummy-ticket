import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('Testing Supabase storage configuration...')

    // Test 1: Check if avatars bucket exists (for user profiles)
    let avatarsBucketExists = false
    let avatarsBucketError = null

    try {
      const { data, error } = await supabase.storage.getBucket('avatars')
      avatarsBucketExists = !error
      avatarsBucketError = error
      console.log('Avatars bucket check result:', { data, error })
    } catch (err) {
      avatarsBucketError = err.message
      console.error('Avatars bucket check failed:', err)
    }

    // Test 2: Check if assets bucket exists (for logos)
    let assetsBucketExists = false
    let assetsBucketError = null

    try {
      const { data, error } = await supabase.storage.getBucket('assets')
      assetsBucketExists = !error
      assetsBucketError = error
      console.log('Assets bucket check result:', { data, error })
    } catch (err) {
      assetsBucketError = err.message
      console.error('Assets bucket check failed:', err)
    }

    // Test 3: Try to list files in avatars bucket
    let avatarsFilesAccessible = false
    let avatarsFilesError = null

    try {
      const { data, error } = await supabase.storage
        .from('avatars')
        .list('', { limit: 1 })
      avatarsFilesAccessible = !error
      avatarsFilesError = error
      console.log('Avatars files list result:', { data, error })
    } catch (err) {
      avatarsFilesError = err.message
      console.error('Avatars files list failed:', err)
    }

    // Test 4: Try to list files in assets bucket
    let assetsFilesAccessible = false
    let assetsFilesError = null

    try {
      const { data, error } = await supabase.storage
        .from('assets')
        .list('', { limit: 1 })
      assetsFilesAccessible = !error
      assetsFilesError = error
      console.log('Assets files list result:', { data, error })
    } catch (err) {
      assetsFilesError = err.message
      console.error('Assets files list failed:', err)
    }

    // Test 5: Check environment variables
    const envCheck = {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      supabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    }

    return NextResponse.json({
      success: true,
      checks: {
        avatars: {
          bucket: {
            exists: avatarsBucketExists,
            error: avatarsBucketError?.message || avatarsBucketError,
            name: 'avatars'
          },
          files: {
            accessible: avatarsFilesAccessible,
            error: avatarsFilesError?.message || avatarsFilesError
          }
        },
        assets: {
          bucket: {
            exists: assetsBucketExists,
            error: assetsBucketError?.message || assetsBucketError,
            name: 'assets'
          },
          files: {
            accessible: assetsFilesAccessible,
            error: assetsFilesError?.message || assetsFilesError
          }
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