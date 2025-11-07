import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request) {
  try {
    // Get user ID from query params or from headers
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Fetch user and profile from database with JOIN
    const { data: userData, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        role,
        status,
        created_at,
        updated_at,
        user_profiles (
          id,
          first_name,
          last_name,
          phone_number,
          country_code,
          date_of_birth,
          nationality,
          address,
          city,
          postal_code,
          passport_number,
                    preferred_language,
          avatar_url,
          notification_preferences,
          privacy_settings
        )
      `)
      .eq('id', userId)
      .eq('status', 'active')
      .single()

    if (error || !userData) {
      console.error('Profile fetch error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch profile data' },
        { status: 404 }
      )
    }

    // Extract user data and profile data from the JOIN result
    const { user_profiles, ...userWithoutPassword } = userData
    const profileData = user_profiles || {} // Handle case where profile might not exist

    // Return user data with complete profile information
    return NextResponse.json({
      success: true,
      user: {
        ...userWithoutPassword,
        created_at: userData.created_at
      },
      profile: {
        id: profileData.id || userData.id,
        first_name: profileData.first_name || null,
        last_name: profileData.last_name || null,
        phone_number: profileData.phone_number || null,
        country_code: profileData.country_code || null,
        date_of_birth: profileData.date_of_birth ? new Date(profileData.date_of_birth).toISOString().split('T')[0] : null,
        nationality: profileData.nationality || null,
        address: profileData.address || null,
        city: profileData.city || null,
        postal_code: profileData.postal_code || null,
        passport_number: profileData.passport_number || null,
        preferred_language: profileData.preferred_language || 'en',
        avatar_url: profileData.avatar_url || null,
        notification_preferences: profileData.notification_preferences || {},
        privacy_settings: profileData.privacy_settings || {},
        // Backward compatibility fields
        email: userData.email,
        role: userData.role,
        status: userData.status
      }
    })

  } catch (error) {
    console.error('Profile fetch API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}