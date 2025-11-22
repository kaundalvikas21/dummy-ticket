import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const supabase = await createClient()

    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      console.error('Session retrieval error:', sessionError)
    }

    // Log user info before logout (optional, for security tracking)
    if (session?.user) {
      console.log(`User logout: ${session.user.email} (${session.user.id}) at ${new Date().toISOString()}`)
    }

    // Sign out from Supabase Auth
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Supabase logout error:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to logout from authentication service',
          details: error.message
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Logout successful'
    })

  } catch (error) {
    console.error('Logout API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error during logout',
        details: error.message
      },
      { status: 500 }
    )
  }
}