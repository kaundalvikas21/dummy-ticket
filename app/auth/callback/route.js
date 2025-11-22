import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()

    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (!error) {
        // Successfully exchanged code for session
        // Redirect to the intended page or default dashboard
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
          // Get user role for proper redirect
          const userRole = user?.app_metadata?.role || 'user'
          const dashboardUrl = next === '/' ? `/${userRole}` : next

          return NextResponse.redirect(`${origin}${dashboardUrl}`)
        }

        return NextResponse.redirect(`${origin}${next}`)
      } else {
        console.error('Auth callback error:', error)
        return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent(error.message)}`)
      }
    } catch (error) {
      console.error('Auth callback exception:', error)
      return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent('Authentication failed')}`)
    }
  }

  // If no code parameter, redirect to login
  return NextResponse.redirect(`${origin}/login?message=No authorization code provided`)
}