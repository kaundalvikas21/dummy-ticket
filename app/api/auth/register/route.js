import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { withRateLimit, getClientIP } from '@/lib/rate-limit'

// Apply rate limiting: 3 registrations per hour per IP
const rateLimitedRegister = withRateLimit(handleRegister, {
  limit: 3,
  window: 3600000, // 1 hour
  identifierGenerator: getClientIP
})

async function handleRegister(request) {
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


    // Automatically assign admin role if email matches ADMIN_EMAIL
    const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase()
    const effectiveRole = email.toLowerCase() === adminEmail ? 'admin' : (role || 'user')


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
          role: effectiveRole,
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

    // 3. Send Account Creation Emails (Non-blocking)
    try {
      const { sendEmail } = await import('@/lib/email')
      const { getWelcomeEmail, getAdminNewUserNotificationEmail } = await import('@/lib/email-templates')

      const userData = {
        first_name: firstName,
        last_name: lastName,
        email: email,
        role: role || 'user',
        nationality: nationality
      }

      // Send Welcome Email to User
      sendEmail({
        to: email,
        subject: `Welcome to ${process.env.APP_NAME || 'Dummy Ticket'}! ✈️`,
        html: getWelcomeEmail(userData)
      }).catch(err => console.error('Error sending welcome email:', err))

      // Send Notification Email to Admin
      const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_FROM
      if (adminEmail) {
        sendEmail({
          to: adminEmail,
          subject: `🔔 New User Registered: ${firstName} ${lastName}`,
          html: getAdminNewUserNotificationEmail(userData)
        }).catch(err => console.error('Error sending admin notification email:', err))
      }
    } catch (emailError) {
      console.error('Failed to initiate email sending:', emailError)
    }

    // 4. Create User Profile manually (backup for trigger)
    if (authData.user?.id) {
      try {
        const { createClient: createAdminClient } = await import('@supabase/supabase-js')
        const supabaseAdmin = createAdminClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY,
          {
            auth: {
              autoRefreshToken: false,
              persistSession: false
            }
          }
        )

        // Check if profile already exists (to avoid duplicate errors if trigger worked)
        const { data: existingProfile } = await supabaseAdmin
          .from('user_profiles')
          .select('id')
          .eq('auth_user_id', authData.user.id)
          .single()

        if (!existingProfile) {
          console.log('Profile not found for new user, creating manually...')
          const { error: profileError } = await supabaseAdmin
            .from('user_profiles')
            .insert({
              auth_user_id: authData.user.id,
              first_name: firstName,
              last_name: lastName,
              email: email,
              phone_number: phoneNumber,
              country_code: countryCode,
              nationality: nationality,
              role: effectiveRole,
              preferred_language: 'en'
            })

          if (profileError) {
            console.error('Manual profile creation failed:', profileError.message)
          } else {
            console.log('Manual profile creation successful')
          }
        }
      } catch (profileCatchError) {
        console.warn('Error in manual profile creation flow:', profileCatchError.message)
      }
    }

    // 5. If phone number was provided, sync it to auth.users after signup
    // This ensures the phone is stored correctly with country code prefix
    if (formattedPhone && authData.user?.id) {
      try {
        const { createClient: createAdminClient } = await import('@supabase/supabase-js')
        const supabaseAdmin = createAdminClient(
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
        role: effectiveRole,
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

// Export the rate-limited handler
export { rateLimitedRegister as POST }