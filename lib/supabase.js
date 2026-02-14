import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Legacy client for backward compatibility (will be deprecated)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client with service role key for privileged operations
// Only create if service key is available
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    storage: {
      // Ensure storage operations have reasonable timeouts
      maxRetries: 3
    }
  })
  : null

// Database types
export const FAQ_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive'
}