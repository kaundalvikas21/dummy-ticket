import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

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

    // Prepare data for database update
    const updatePayload = {
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
      avatar_url: profileData.avatar_url?.trim() || null,
      notification_preferences: profileData.notification_preferences || {},
      privacy_settings: profileData.privacy_settings || {},
      updated_at: new Date().toISOString()
    }

    // Update user profile in database
    const { data: updatedProfile, error } = await supabase
      .from('user_profiles')
      .update(updatePayload)
      .eq('user_id', userId)
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
        updatePayload: updatePayload
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
        // Backward compatibility fields will be added by frontend
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