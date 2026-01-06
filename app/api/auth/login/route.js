import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase'
import { withRateLimit, getClientIP } from '@/lib/rate-limit'

// Apply rate limiting: 5 attempts per minute per IP
const rateLimitedLogin = withRateLimit(handleLogin, {
  limit: 5,
  window: 60000,
  identifierGenerator: getClientIP
})

async function handleLogin(request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Authenticate user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      console.error('Supabase auth error:', authError)

      // Map Supabase auth errors to our existing error codes
      let errorCode = 'INVALID_CREDENTIALS'
      let errorMessage = 'Invalid email or password'

      if (authError.message.includes('Invalid login credentials')) {
        errorCode = 'INVALID_PASSWORD'
        errorMessage = 'Invalid email or password'
      } else if (authError.message.includes('Email not confirmed')) {
        errorCode = 'EMAIL_NOT_CONFIRMED'
        errorMessage = 'Please confirm your email address before logging in'
      } else if (authError.message.includes('User not found')) {
        errorCode = 'EMAIL_NOT_FOUND'
        errorMessage = 'You have to create an account'
      }

      return NextResponse.json(
        {
          success: false,
          code: errorCode,
          message: errorMessage
        },
        { status: 401 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        {
          success: false,
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        },
        { status: 401 }
      )
    }

    // Get user profile from database
    const profileResult = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('auth_user_id', authData.user.id)
      .single()

    let profile = profileResult.data
    const profileError = profileResult.error

    if (profileError) {
      console.error('Profile fetch error:', profileError)

      // If no profile exists, create a basic one
      if (profileError.code === 'PGRST116') {
        const newProfile = {
          auth_user_id: authData.user.id,
          first_name: authData.user.user_metadata?.first_name || '',
          last_name: authData.user.user_metadata?.last_name || '',
          preferred_language: 'en'
        }

        const createdProfileResult = await supabaseAdmin
          .from('user_profiles')
          .insert(newProfile)
          .select()
          .single()

        const createdProfile = createdProfileResult.data
        const createError = createdProfileResult.error

        if (createError) {
          console.error('Profile creation error:', createError)
        } else {
          profile = createdProfile
        }
      }
    }

    // Return success response with user and profile data
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        role: authData.user.app_metadata?.role || 'user',
        created_at: authData.user.created_at,
        updated_at: authData.user.updated_at
      },
      profile: profile ? {
        id: profile.id,
        auth_user_id: profile.auth_user_id,
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone_number: profile.phone_number,
        country_code: profile.country_code,
        date_of_birth: profile.date_of_birth,
        nationality: profile.nationality,
        address: profile.address,
        city: profile.city,
        postal_code: profile.postal_code,
        preferred_language: profile.preferred_language || 'en',
        avatar_url: profile.avatar_url,
        notification_preferences: profile.notification_preferences || {},
        privacy_settings: profile.privacy_settings || {},
        // Backward compatibility fields
        email: authData.user.email,
        role: authData.user.app_metadata?.role || 'user',
        status: 'active'
      } : {
        // Fallback profile if no profile exists
        id: authData.user.id,
        auth_user_id: authData.user.id,
        first_name: authData.user.user_metadata?.first_name || '',
        last_name: authData.user.user_metadata?.last_name || '',
        email: authData.user.email,
        role: authData.user.app_metadata?.role || 'user',
        status: 'active',
        preferred_language: 'en'
      }
    })

  } catch (error) {
    console.error('Login API error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}

// Export the rate-limited handler
export { rateLimitedLogin as POST }