import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create a Supabase client that doesn't persist sessions
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
})

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') || '/'

  if (!token_hash || !type) {
    return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    if (type === 'recovery') {
      // For password recovery, we'll redirect directly to update-password with the token_hash
      // The update-password page will handle the OTP verification there
      const redirectUrl = `${new URL(request.url).origin}${next}?token_hash=${token_hash}&type=recovery`

      return Response.redirect(redirectUrl, 302)
    } else {
      // Handle other types (signup, email_change, etc.)
      const { error } = await supabase.auth.verifyOtp({
        token_hash,
        type
      })

      if (error) {
        console.error('OTP verification error:', error)
        return Response.redirect(`${new URL(request.url).origin}/login?error=verification_failed`, 302)
      }

      // For non-recovery types, redirect to login with success message
      return Response.redirect(`${new URL(request.url).origin}/login?message=Email verified successfully`, 302)
    }
  } catch (error) {
    console.error('Confirm error:', error)
    return Response.redirect(`${new URL(request.url).origin}/login?error=server_error`, 302)
  }
}