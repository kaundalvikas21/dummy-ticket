import { NextResponse } from 'next/server'
import { 
  requireAuth, 
  createSupabaseClientWithAuth, 
  createAuthError 
} from "@/lib/auth-helper"

export async function GET(request) {
  try {
    // Create Supabase client with auth
    const supabase = createSupabaseClientWithAuth(request)
    
    // Authenticate user
    const user = await requireAuth(supabase)

    // Get user profile from database
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('auth_user_id', user.id)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Profile fetch error:', profileError)
      return createAuthError('Failed to fetch user profile', 500)
    }

    // Create profile response
    const profileData = profile ? {
      id: profile.id,
      auth_user_id: profile.auth_user_id,
      first_name: profile.first_name,
      last_name: profile.last_name,
      phone_number: profile.phone_number,
      country_code: profile.country_code,
      date_of_birth: profile.date_of_birth,
      nationality: profile.nationality,
      passport_number: profile.passport_number,
      address: profile.address,
      city: profile.city,
      postal_code: profile.postal_code,
      preferred_language: profile.preferred_language || 'en',
      avatar_url: profile.avatar_url,
      notification_preferences: profile.notification_preferences || {},
      privacy_settings: profile.privacy_settings || {},
      role: profile.role || 'user',
      email: user.email,
      status: 'active'
    } : {
      id: user.id,
      auth_user_id: user.id,
      first_name: user.user_metadata?.first_name || null,
      last_name: user.user_metadata?.last_name || null,
      phone_number: null,
      country_code: null,
      date_of_birth: null,
      nationality: null,
      passport_number: null,
      address: null,
      city: null,
      postal_code: null,
      preferred_language: 'en',
      avatar_url: null,
      notification_preferences: {},
      privacy_settings: {},
      role: user.app_metadata?.role || 'user',
      email: user.email,
      status: 'active'
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.app_metadata?.role || 'user',
        status: 'active',
        created_at: user.created_at,
        updated_at: user.updated_at
      },
      profile: profileData
    })

  } catch (error) {
    console.error('Profile API error:', error)
    return createAuthError(error.message || 'Internal server error', 500)
  }
}

