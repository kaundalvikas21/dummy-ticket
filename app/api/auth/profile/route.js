import { NextResponse } from 'next/server'
import {
  requireAuth,
  createSupabaseClientWithAuth,
  createAuthError
} from "@/lib/auth-helper"

export async function GET(request) {
  try {
    // Create Supabase client with auth (now uses cookies, no request param needed)
    const supabase = await createSupabaseClientWithAuth()

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
    let profileData;
    const isDefaultDBProfile = profile && (profile.first_name === 'Unknown' || !profile.first_name);

    if (profile && !isDefaultDBProfile) {
      profileData = {
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
      };
    } else {
      // Fallback or override "Unknown" with Google metadata
      profileData = {
        id: profile?.id || user.id,
        auth_user_id: user.id,
        first_name: user.user_metadata?.first_name || user.user_metadata?.given_name || (user.user_metadata?.full_name?.split(' ')[0]) || (profile?.first_name !== 'Unknown' ? profile?.first_name : null),
        last_name: user.user_metadata?.last_name || user.user_metadata?.family_name ||
          (user.user_metadata?.full_name?.includes(' ') ? user.user_metadata?.full_name?.split(' ').slice(1).join(' ') : '') ||
          (profile?.last_name !== 'User' ? profile?.last_name : null),
        phone_number: profile?.phone_number || user.user_metadata?.phone_number || null,
        country_code: profile?.country_code || user.user_metadata?.country_code || null,
        date_of_birth: profile?.date_of_birth || null,
        nationality: profile?.nationality || user.user_metadata?.nationality || null,
        passport_number: profile?.passport_number || null,
        address: profile?.address || null,
        city: profile?.city || null,
        postal_code: profile?.postal_code || null,
        preferred_language: profile?.preferred_language || user.user_metadata?.preferred_language || 'en',
        avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
        notification_preferences: profile?.notification_preferences || {},
        privacy_settings: profile?.privacy_settings || {},
        role: profile?.role || user.app_metadata?.role || user.user_metadata?.role || 'user',
        email: user.email,
        status: 'active'
      };
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

