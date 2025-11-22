import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function PUT(request) {
  try {
    const updateData = await request.json()

    // Get user ID from Authorization header or from request body
    const userId = updateData.userId
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Remove userId from updateData as it shouldn't be updated
    const { userId: _, ...profileData } = updateData

    // Validate required fields
    if (!profileData.first_name || profileData.first_name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'First name is required' },
        { status: 400 }
      )
    }

    if (!profileData.last_name || profileData.last_name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Last name is required' },
        { status: 400 }
      )
    }

    // Validate that email is not being updated (security measure)
    if (profileData.email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email changes are not allowed for security reasons. Please contact support if you need to update your email address.',
          details: 'Email addresses are immutable after account creation to prevent account takeover.'
        },
        { status: 400 }
      )
    }

    // Get Supabase Auth user to verify authentication
    const supabase = await createClient()
    const { data: authUser, error: authError } = await supabase.auth.getUser(userId)

    if (authError || !authUser?.user) {
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 }
      )
    }

    // Prepare data for user_profiles table update
    const profileUpdatePayload = {
      first_name: profileData.first_name?.trim() || null,
      last_name: profileData.last_name?.trim() || null,
      phone_number: profileData.phone_number?.trim() || null,
      address: profileData.address?.trim() || null,
      date_of_birth: profileData.date_of_birth || null,
      nationality: profileData.nationality?.trim() || null,
      city: profileData.city?.trim() || null,
      postal_code: profileData.postal_code?.trim() || null,
      country_code: profileData.country_code?.trim() || null,
      preferred_language: profileData.preferred_language || 'en',
      passport_number: profileData.passport_number?.trim() || null,
      // Only update avatar_url if explicitly provided (not null/undefined)
      ...(profileData.avatar_url !== undefined && { avatar_url: profileData.avatar_url?.trim() || null }),
      notification_preferences: profileData.notification_preferences || {},
      privacy_settings: profileData.privacy_settings || {},
      updated_at: new Date().toISOString()
    }

    // Update user profile in database
    const { data: updatedProfile, error } = await supabaseAdmin
      .from('user_profiles')
      .update(profileUpdatePayload)
      .eq('auth_user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Profile update error details:', {
        error: error,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        userId: userId,
        profileUpdatePayload: profileUpdatePayload
      })
      return NextResponse.json(
        {
          success: false,
          error: `Failed to update profile: ${error.message || 'Unknown error'}`,
          details: error.details,
          code: error.code
        },
        { status: 500 }
      )
    }

    if (!updatedProfile) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Return updated profile data with consistent format
    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      profile: {
        id: updatedProfile.id,
        auth_user_id: updatedProfile.auth_user_id,
        email: authUser.user.email, // Email from Supabase Auth
        first_name: updatedProfile.first_name,
        last_name: updatedProfile.last_name,
        phone_number: updatedProfile.phone_number,
        country_code: updatedProfile.country_code,
        date_of_birth: updatedProfile.date_of_birth ? new Date(updatedProfile.date_of_birth).toISOString().split('T')[0] : null,
        nationality: updatedProfile.nationality,
        address: updatedProfile.address,
        city: updatedProfile.city,
        postal_code: updatedProfile.postal_code,
        passport_number: updatedProfile.passport_number,
        preferred_language: updatedProfile.preferred_language || 'en',
        avatar_url: updatedProfile.avatar_url,
        notification_preferences: updatedProfile.notification_preferences || {},
        privacy_settings: updatedProfile.privacy_settings || {},
      }
    })

  } catch (error) {
    console.error('Profile update API error details:', {
      error: error,
      message: error.message,
      stack: error.stack,
      userId: updateData?.userId,
      updateData: updateData
    })
    return NextResponse.json(
      {
        success: false,
        error: `Server error: ${error.message || 'Internal server error'}`
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request) {
  // For partial updates, use the same logic as PUT
  return PUT(request)
}