import { NextResponse } from 'next/server'
import {
  requireAuth,
  createSupabaseClientWithAuth,
  createAuthError
} from "@/lib/auth-helper"
import { createClient } from '@supabase/supabase-js'

export async function PUT(request) {
  try {
    // Create authenticated Supabase client and get authenticated user
    const supabase = createSupabaseClientWithAuth(request)
    const user = await requireAuth(supabase)

    // Get update data from request body
    const updateData = await request.json()

    // CRITICAL SECURITY: Never allow userId from request body - use authenticated user's ID only
    const userId = user.id

    // Remove any userId from updateData to prevent confusion
    const { userId: _, ...profileData } = updateData

    // Validate required fields
    if (profileData.first_name && profileData.first_name.trim().length === 0) {
      return createAuthError('First name cannot be empty', 400)
    }

    if (profileData.last_name && profileData.last_name.trim().length === 0) {
      return createAuthError('Last name cannot be empty', 400)
    }

    // Validate nationality if it's being updated or if it's a new profile
    if ((profileData.nationality !== undefined && !profileData.nationality) || (profileData.nationality && profileData.nationality.trim().length === 0)) {
      return createAuthError('Nationality is required', 400)
    }

    // Validate that email is not being updated (security measure)
    if (profileData.email) {
      return createAuthError(
        'Email changes are not allowed for security reasons. Please contact support if you need to update your email address.',
        400
      )
    }

    // Use admin client for database operations to bypass RLS if needed
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

    // Get existing complete profile to preserve fields during partial updates
    const { data: existingProfile } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('auth_user_id', userId)
      .single()

    // Prepare data for user_profiles table update with proper partial update handling
    const profileUpdatePayload = {
      // Only include fields that are explicitly provided in profileData
      // undefined fields will preserve existing values, null/empty strings will be updated
      ...(profileData.first_name !== undefined && { first_name: profileData.first_name?.trim() || null }),
      ...(profileData.last_name !== undefined && { last_name: profileData.last_name?.trim() || null }),
      ...(profileData.phone_number !== undefined && { phone_number: profileData.phone_number?.trim() || null }),
      ...(profileData.address !== undefined && { address: profileData.address?.trim() || null }),
      ...(profileData.date_of_birth !== undefined && { date_of_birth: profileData.date_of_birth || null }),
      ...(profileData.nationality !== undefined && { nationality: profileData.nationality?.trim() || null }),
      ...(profileData.city !== undefined && { city: profileData.city?.trim() || null }),
      ...(profileData.postal_code !== undefined && { postal_code: profileData.postal_code?.trim() || null }),
      ...(profileData.country_code !== undefined && { country_code: profileData.country_code?.trim() || null }),
      ...(profileData.preferred_language !== undefined && { preferred_language: profileData.preferred_language || 'en' }),
      ...(profileData.passport_number !== undefined && { passport_number: profileData.passport_number?.trim() || null }),
      ...(profileData.avatar_url !== undefined && { avatar_url: profileData.avatar_url?.trim() || null }),
      ...(profileData.avatar_filename !== undefined && { avatar_filename: profileData.avatar_filename?.trim() || null }),
      ...(profileData.avatar_storage_path !== undefined && { avatar_storage_path: profileData.avatar_storage_path?.trim() || null }),
      ...(profileData.avatar_file_size !== undefined && { avatar_file_size: profileData.avatar_file_size || null }),

      notification_preferences: profileData.notification_preferences || existingProfile?.notification_preferences || {},
      privacy_settings: profileData.privacy_settings || existingProfile?.privacy_settings || {},
      updated_at: new Date().toISOString()
    }

    // If this is a partial update and we have existing profile, preserve fields not provided
    if (existingProfile && Object.keys(profileData).length < 15) { // Less than full profile update
      // Preserve all fields that weren't explicitly updated
      const allProfileFields = [
        'first_name', 'last_name', 'phone_number', 'address', 'date_of_birth',
        'nationality', 'city', 'postal_code', 'country_code', 'preferred_language',
        'passport_number', 'notification_preferences', 'privacy_settings'
      ]

      allProfileFields.forEach(field => {
        if (profileData[field] === undefined && existingProfile[field] !== undefined) {
          profileUpdatePayload[field] = existingProfile[field]
        }
      })
    }

    // Ensure required fields are never null for new profiles
    if (!existingProfile) {
      profileUpdatePayload.first_name = profileUpdatePayload.first_name || 'User'
      profileUpdatePayload.last_name = profileUpdatePayload.last_name || 'Name'
    }

    // Update user profile in database - only the authenticated user's profile
    let { data: updatedProfile, error } = await supabaseAdmin
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
      return createAuthError(`Failed to update profile: ${error.message || 'Unknown error'}`, 500)
    }

    if (!updatedProfile) {
      // Create profile if it doesn't exist
      const { data: newProfile, error: createError } = await supabaseAdmin
        .from('user_profiles')
        .insert({
          auth_user_id: userId,
          ...profileUpdatePayload,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (createError) {
        console.error('Profile creation error:', createError)
        return createAuthError(`Failed to create profile: ${createError.message}`, 500)
      }

      updatedProfile = newProfile
    }

    // Sync to Supabase Auth (auth.users table)
    // Note: 'phone' must be top-level field, others go in user_metadata
    const authUpdate = { user_metadata: {} }

    // Phone is a top-level field in auth.users
    if (profileUpdatePayload.phone_number) {
      // Format phone with country code for Supabase (expects E.164 format)
      const countryCode = profileUpdatePayload.country_code || updatedProfile.country_code || ''
      authUpdate.phone = countryCode + profileUpdatePayload.phone_number
    }

    // Other fields go in user_metadata
    if (profileUpdatePayload.first_name) authUpdate.user_metadata.first_name = profileUpdatePayload.first_name
    if (profileUpdatePayload.last_name) authUpdate.user_metadata.last_name = profileUpdatePayload.last_name
    if (profileUpdatePayload.nationality !== undefined) authUpdate.user_metadata.nationality = profileUpdatePayload.nationality
    if (profileUpdatePayload.preferred_language !== undefined) authUpdate.user_metadata.preferred_language = profileUpdatePayload.preferred_language

    // Update auth.users if we have data to sync
    if (authUpdate.phone || Object.keys(authUpdate.user_metadata).length > 0) {
      const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(userId, authUpdate)
      if (authUpdateError) {
        console.warn('Failed to sync to auth.users:', authUpdateError.message)
      }
    }

    // Return updated profile data with consistent format
    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      profile: {
        id: updatedProfile.id,
        auth_user_id: updatedProfile.auth_user_id,
        email: user.email, // Email from authenticated user
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
      stack: error.stack
    })
    return createAuthError(`Server error: ${error.message || 'Internal server error'}`, 500)
  }
}

export async function PATCH(request) {
  // For partial updates, use the same logic as PUT
  return PUT(request)
}