import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request) {
  try {
    const { email, password, role, firstName, lastName, phoneNumber, countryCode, nationality } = await request.json()

    // Validate required fields with specific error messages
    const missingFields = []
    if (!email) missingFields.push('email')
    if (!password) missingFields.push('password')
    if (!firstName || firstName.trim().length === 0) missingFields.push('first name')
    if (!lastName || lastName.trim().length === 0) missingFields.push('last name')
    if (!nationality || nationality.trim().length === 0) missingFields.push('nationality')

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Missing required fields: ${missingFields.join(', ')}`,
          details: missingFields
        },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

  
    // Format phone number for Supabase auth (E.164 format required)
    let formattedPhone = null
    if (phoneNumber && phoneNumber.trim()) {
      // Ensure country code starts with +
      const cleanCountryCode = countryCode ? (countryCode.startsWith('+') ? countryCode : `+${countryCode}`) : '+1'
      // Remove any non-digit characters from phone number
      const cleanPhone = phoneNumber.replace(/\D/g, '')
      // Combine to E.164 format
      formattedPhone = cleanCountryCode + cleanPhone
    }

    
    // Prepare signup options (phone will be synced via admin API after signup)
    const signUpOptions = {
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          role: role || 'user',
          phone_number: phoneNumber || null,
          country_code: countryCode || null,
          nationality: nationality || null,
          preferred_language: 'en'
        }
      }
    }

    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp(signUpOptions)

    
    if (authError) {
      console.error('Supabase auth error:', authError)

      // Map Supabase auth errors to our existing error codes
      let errorMessage = authError.message

      if (authError.message.includes('User already registered')) {
        return NextResponse.json(
          { success: false, error: 'User with this email already exists' },
          { status: 409 }
        )
      }

      return NextResponse.json(
        { success: false, error: errorMessage || 'Registration failed' },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { success: false, error: 'Failed to create user account' },
        { status: 500 }
      )
    }

  // If phone number was provided, sync it to auth.users after signup
    // This ensures the phone is stored correctly with country code prefix
    if (formattedPhone && authData.user?.id) {
      try {
        const { createClient } = await import('@supabase/supabase-js')
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

        // Update auth.users phone field using admin API
        const { error: phoneUpdateError } = await supabaseAdmin.auth.admin.updateUserById(
          authData.user.id,
          { phone: formattedPhone }
        )

        if (phoneUpdateError) {
          console.warn('Failed to sync phone to auth.users after signup:', phoneUpdateError.message)
        } else {
          console.log('Successfully synced phone to auth.users:', formattedPhone)
        }
      } catch (error) {
        console.warn('Error syncing phone to auth.users:', error.message)
      }
    }

    // Return success - profile will be created automatically by database triggers
    return NextResponse.json({
      success: true,
      message: 'Registration successful! Please check your email to confirm your account.',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        role: role || 'user',
        created_at: authData.user.created_at,
        updated_at: authData.user.updated_at,
        email_confirmed_at: authData.user.email_confirmed_at
      }
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}