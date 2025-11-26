import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import {
  requireAuth,
  createSupabaseClientWithAuth,
  createAuthError
} from '@/lib/auth-helper'
import {
  generateUniqueFileName,
  cleanupOldAvatar,
  validateAvatarFile,
  extractStoragePathFromUrl
} from '@/lib/avatar-utils'

export async function POST(request) {
  try {
    // Create authenticated Supabase client and get authenticated user
    const supabaseClient = createSupabaseClientWithAuth(request)
    const user = await requireAuth(supabaseClient)

    // Use authenticated user's ID - never accept from request
    const userId = user.id

    const formData = await request.formData()
    const file = formData.get('file')

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // Enhanced file validation using utility function
    const validation = validateAvatarFile(file)
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      )
    }

    // Check if user profile exists, create if missing
    console.log('Checking if user profile exists for user:', userId)
    const { data: profile, error: profileError } = await supabaseClient
      .from('user_profiles')
      .select('id')
      .eq('auth_user_id', userId)
      .single()

    if (profileError || !profile) {
      console.log('User profile not found, creating new profile...')

      // Get user metadata for profile creation
      const { data: { user: authUser } } = await supabaseClient.auth.getUser()

      if (authUser) {
        const { error: createError } = await supabaseClient
          .from('user_profiles')
          .insert({
            auth_user_id: userId,
            first_name: authUser.user_metadata?.first_name || 'User',
            last_name: authUser.user_metadata?.last_name || 'Name',
            phone_number: authUser.user_metadata?.phone_number || null,
            nationality: authUser.user_metadata?.nationality || 'US',
            preferred_language: authUser.user_metadata?.preferred_language || 'en',
            role: authUser.user_metadata?.role || 'user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (createError) {
          console.error('Profile creation failed:', createError)
          return NextResponse.json({
            success: false,
            error: 'Failed to create user profile',
            details: createError.message,
            code: 'PROFILE_CREATION_FAILED'
          }, { status: 500 })
        }

        console.log('User profile created successfully')
      }
    } else {
      console.log('User profile exists:', profile.id)
    }

    // Get current profile to check for existing avatar
    const { data: currentProfile } = await supabaseClient
      .from('user_profiles')
      .select('avatar_url, avatar_storage_path')
      .eq('auth_user_id', userId)
      .single()

    // STEP 1: Clean up old avatar if it exists
    if (currentProfile?.avatar_storage_path) {
      console.log('Cleaning up old avatar:', currentProfile.avatar_storage_path)
      await cleanupOldAvatar(userId, supabaseClient, currentProfile.avatar_storage_path)
    }

    // STEP 2: Generate unique filename with conflict resolution
    const originalFileName = file.name
    const uniqueFileName = await generateUniqueFileName(userId, originalFileName, supabaseClient)
    const filePath = `${userId}/${uniqueFileName}`

    console.log('Generated unique filename:', {
      original: originalFileName,
      unique: uniqueFileName,
      path: filePath
    })

    // Upload to Supabase Storage
    console.log('Attempting to upload to bucket: avatars, file path:', filePath)
    console.log('File details:', {
      originalName: originalFileName,
      uniqueName: uniqueFileName,
      size: file.size,
      type: file.type,
      userId: userId
    })

    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) {
      console.error('Detailed upload error:', {
        error: uploadError,
        message: uploadError.message,
        code: uploadError.statusCode || 'UNKNOWN',
        filePath: filePath,
        bucket: 'avatars'
      })

      // Return specific error based on the error type
      let errorMessage = 'Failed to upload image'
      if (uploadError.message?.includes('bucket') || uploadError.message?.includes('not found')) {
        errorMessage = 'Storage bucket "avatars" not found. Please contact administrator to set up storage.'
      } else if (uploadError.message?.includes('permission') || uploadError.message?.includes('unauthorized')) {
        errorMessage = 'Permission denied. You may not have permission to upload files.'
      } else if (uploadError.message?.includes('too large')) {
        errorMessage = 'File size exceeds storage limits.'
      } else if (uploadError.statusCode === 413) {
        errorMessage = 'File too large. Maximum size is 5MB.'
      }

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          details: uploadError.message,
          code: uploadError.statusCode || 'STORAGE_ERROR'
        },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabaseClient.storage
      .from('avatars')
      .getPublicUrl(filePath)

    const avatarUrl = urlData.publicUrl

    // Update user profile with comprehensive avatar information
    console.log('Updating user profile with avatar data for user:', userId)
    const { error: updateError } = await supabaseClient
      .from('user_profiles')
      .update({
        avatar_url: avatarUrl,
        avatar_filename: uniqueFileName,
        avatar_storage_path: filePath,
        updated_at: new Date().toISOString()
      })
      .eq('auth_user_id', userId)

    if (updateError) {
      console.error('Profile update error:', {
        error: updateError,
        message: updateError.message,
        userId: userId,
        avatarUrl: avatarUrl
      })

      // Return warning but still success since image was uploaded
      return NextResponse.json({
        success: true,
        message: 'Avatar uploaded successfully, but profile update failed',
        avatarUrl: avatarUrl,
        avatarFileName: uniqueFileName,
        avatarFileSize: file.size,
        filePath: filePath,
        warning: 'Profile update failed. Please try updating your profile manually.',
        error: updateError.message
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Avatar uploaded successfully',
      avatarUrl: avatarUrl,
      avatarFileName: uniqueFileName,
      avatarFileSize: file.size,
      filePath: filePath
    })

  } catch (error) {
    console.error('Avatar upload API error:', error)

    // Handle authentication errors specifically
    if (error.message.includes('Authentication') || error.message.includes('required')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required. Please log in and try again.',
          code: 'AUTH_REQUIRED'
        },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}