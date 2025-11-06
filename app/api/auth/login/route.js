import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export async function POST(request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      )
    }

    // First check if email exists (regardless of status)
    const { data: emailCheck, error: emailError } = await supabase
      .from('users')
      .select('id, status')
      .eq('email', email)
      .single()

    if (emailError || !emailCheck) {
      return NextResponse.json(
        {
          success: false,
          code: 'EMAIL_NOT_FOUND',
          message: 'You have to create an account'
        },
        { status: 401 }
      )
    }

    // Check if account is active
    if (emailCheck.status !== 'active') {
      return NextResponse.json(
        {
          success: false,
          code: 'ACCOUNT_INACTIVE',
          message: 'Your account is not active. Please contact support.'
        },
        { status: 401 }
      )
    }

    // Fetch user and profile from database with JOIN (email exists and is active)
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
          preferred_language,
          avatar_url,
          notification_preferences,
          privacy_settings
        )
      `)
      .eq('email', email)
      .eq('status', 'active')
      .single()

    if (error || !userData) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Since we don't have password in the result (due to JOIN), we need to fetch it separately
    const { data: userWithPassword, error: passwordError } = await supabase
      .from('users')
      .select('password')
      .eq('id', userData.id)
      .single()

    if (passwordError || !userWithPassword?.password) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Compare password hash
    const isValidPassword = await bcrypt.compare(password, userWithPassword.password)
    if (!isValidPassword) {
      return NextResponse.json(
        {
          success: false,
          code: 'INVALID_PASSWORD',
          message: 'Invalid email or password'
        },
        { status: 401 }
      )
    }

    // Extract user data and profile data from the JOIN result
    const { user_profiles, ...userWithoutPassword } = userData
    const profileData = user_profiles || {} // Handle case where profile might not exist

    // Return user data with complete profile information
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: userWithoutPassword,
      profile: {
        id: profileData.id || userData.id,
        first_name: profileData.first_name || null,
        last_name: profileData.last_name || null,
        phone_number: profileData.phone_number || null,
        country_code: profileData.country_code || null,
        date_of_birth: profileData.date_of_birth || null,
        nationality: profileData.nationality || null,
        address: profileData.address || null,
        city: profileData.city || null,
        postal_code: profileData.postal_code || null,
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
    console.error('Login API error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}