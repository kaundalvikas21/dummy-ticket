import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const userId = formData.get('userId')

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `avatar_${userId}_${Date.now()}.${fileExt}`
    const filePath = `avatars/${userId}/${fileName}`

    // Upload to Supabase Storage
    console.log('Attempting to upload to bucket: avatars, file path:', filePath)
    console.log('File details:', {
      name: file.name,
      size: file.size,
      type: file.type,
      userId: userId
    })

    const { data: uploadData, error: uploadError } = await supabase.storage
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
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    const avatarUrl = urlData.publicUrl

    // Update user profile with new avatar URL
    console.log('Updating user profile with avatar URL for user:', userId)
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)

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
        filePath: filePath,
        warning: 'Profile update failed. Please try updating your profile manually.',
        error: updateError.message
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Avatar uploaded successfully',
      avatarUrl: avatarUrl,
      filePath: filePath
    })

  } catch (error) {
    console.error('Avatar upload API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}