import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import {
  requireAuth,
  createSupabaseClientWithAuth,
  createAuthError
} from '@/lib/auth-helper'
import {
  cleanupOldAvatar
} from '@/lib/avatar-utils'

export async function DELETE(request) {
  console.log('=== AVATAR REMOVAL API START ===')

  try {
    // Create authenticated Supabase client and get authenticated user
    const supabaseClient = createSupabaseClientWithAuth(request)
    const user = await requireAuth(supabaseClient)

    console.log('User authenticated for avatar removal:', user.id)

    // Use authenticated user's ID - never accept from request
    const userId = user.id

    // STEP 1: Get current profile to find avatar URL
    console.log('STEP 1: Fetching current user profile...')

    const { data: profile, error: profileError } = await supabaseClient
      .from('user_profiles')
      .select('avatar_url, avatar_storage_path, avatar_filename')
      .eq('auth_user_id', userId)
      .single()

    if (profileError || !profile) {
      console.error('Profile fetch error:', profileError)
      return NextResponse.json({
        success: false,
        error: 'User profile not found',
        details: profileError?.message || 'Unable to fetch user profile',
        code: 'PROFILE_NOT_FOUND'
      }, { status: 404 })
    }

    console.log('Current avatar info:', {
      url: profile.avatar_url,
      filename: profile.avatar_filename,
      storagePath: profile.avatar_storage_path
    })

    // STEP 2: Check if user has an avatar to remove
    if (!profile.avatar_url || profile.avatar_url.trim() === '') {
      console.log('No avatar to remove')
      return NextResponse.json({
        success: true,
        message: 'No avatar to remove - user already has default avatar',
        code: 'NO_AVATAR'
      })
    }

    // STEP 3: Delete file from storage using stored path
    console.log('STEP 2: Removing avatar from storage...')

    // Use the stored storage path for reliable deletion
    const storagePath = profile.avatar_storage_path
    let deleteSuccess = false

    if (storagePath) {
      deleteSuccess = await cleanupOldAvatar(userId, supabaseClient, storagePath)
      if (deleteSuccess) {
        console.log('Avatar file removed successfully from storage:', storagePath)
      } else {
        console.log('Warning: File deletion failed, but continuing with profile update')
      }
    } else {
      // Fallback to URL extraction if storage_path is missing (legacy files)
      console.log('No storage path found, falling back to URL extraction')
      try {
        const url = new URL(profile.avatar_url)
        const pathParts = url.pathname.split('/')
        const avatarsIndex = pathParts.findIndex(part => part === 'avatars')

        if (avatarsIndex !== -1 && avatarsIndex < pathParts.length - 1) {
          const fallbackPath = pathParts.slice(avatarsIndex + 1).join('/')
          deleteSuccess = await cleanupOldAvatar(userId, supabaseClient, fallbackPath)
        }
      } catch (extractionError) {
        console.error('URL extraction failed:', extractionError)
      }
    }

    // STEP 4: Update profile to clear avatar URL
    console.log('STEP 3: Clearing avatar URL from profile...')

    const { error: updateError, data: updatedProfile } = await supabaseClient
      .from('user_profiles')
      .update({
        avatar_url: null,
        avatar_filename: null,
        avatar_storage_path: null,
        updated_at: new Date().toISOString()
      })
      .eq('auth_user_id', userId)
      .select()
      .single()

    if (updateError) {
      console.error('Profile update error:', updateError)
      return NextResponse.json({
        success: false,
        error: 'Failed to update profile',
        details: updateError.message,
        code: 'PROFILE_UPDATE_FAILED'
      }, { status: 500 })
    }

    console.log('Profile updated successfully, avatar URL cleared')

    const response = {
      success: true,
      message: 'Avatar removed successfully',
      profileId: updatedProfile.id,
      removedFileName: profile.avatar_filename,
      deleteSuccess: deleteSuccess,
      code: 'AVATAR_REMOVED'
    }

    console.log('=== AVATAR REMOVAL SUCCESS ===')
    return NextResponse.json(response)

  } catch (error) {
    console.error('=== AVATAR REMOVAL API ERROR ===')
    console.error('Error type:', error.constructor.name)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)

    // Handle authentication errors specifically
    if (error.message.includes('Authentication') || error.message.includes('required')) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required. Please log in and try again.',
        details: error.message,
        code: 'AUTH_REQUIRED'
      }, { status: 401 })
    }

    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message,
      code: 'INTERNAL_ERROR',
      errorType: error.constructor.name
    }, { status: 500 })
  }
}