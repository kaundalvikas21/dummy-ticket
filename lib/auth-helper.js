/**
 * Unified Authentication Helper for Supabase
 *
 * This helper provides consistent authentication across all API endpoints
 * and eliminates the need for cookie-based authentication.
 */

import { createClient } from '@supabase/supabase-js'

/**
 * Requires authenticated user and returns user data
 * @param {Object} supabase - Supabase client instance
 * @returns {Promise<Object>} User object with authentication data
 * @throws {Error} If user is not authenticated
 */
export async function requireAuth(supabase) {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      console.error('Authentication error:', error.message)
      throw new Error('Authentication failed: ' + error.message)
    }

    if (!user) {
      throw new Error('No authenticated user found')
    }

    return user
  } catch (error) {
    console.error('requireAuth error:', error)
    throw new Error('Authentication required')
  }
}

/**
 * Requires authenticated admin user and returns user data
 * @param {Object} supabase - Supabase client instance
 * @returns {Promise<Object>} Admin user object with authentication data
 * @throws {Error} If user is not authenticated or not an admin
 */
export async function requireAdmin(supabase) {
  try {
    const user = await requireAuth(supabase)

    // Check user role from app_metadata first, then fallback to database profile
    let isAdmin = false

    // Check app_metadata role
    if (user.app_metadata?.role === 'admin') {
      isAdmin = true
    }

    // If not found in app_metadata, check user profile table
    if (!isAdmin) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('auth_user_id', user.id)
        .single()

      if (profile && profile.role === 'admin') {
        isAdmin = true
      }
    }

    if (!isAdmin) {
      throw new Error('Admin access required')
    }

    return user
  } catch (error) {
    console.error('requireAdmin error:', error)
    throw new Error('Admin authentication required')
  }
}

/**
 * Creates Supabase client with authentication headers from request
 * @param {Request} request - Next.js API request object
 * @returns {Object} Supabase client instance with auth context
 */
export function createSupabaseClientWithAuth(request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  // Extract JWT token from Authorization header if present
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7)

    // For API requests, we typically only have the access token
    // Create a minimal session with access token only
    // This works for server-side API validation
    supabase.auth.setSession({
      access_token: token,
      refresh_token: token // Use access token as fallback for refresh token
    })
  }

  return supabase
}

/**
 * Creates standardized error response for authentication failures
 * @param {string} message - Error message
 * @param {number} status - HTTP status code (default: 401)
 * @returns {Response} Next.js error response
 */
export function createAuthError(message = 'Authentication required', status = 401) {
  return Response.json(
    {
      success: false,
      error: message,
      code: status
    },
    {
      status,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  )
}

/**
 * Creates standardized success response
 * @param {Object} data - Response data
 * @param {number} status - HTTP status code (default: 200)
 * @returns {Response} Next.js success response
 */
export function createSuccessResponse(data, status = 200) {
  return Response.json(
    {
      success: true,
      data
    },
    {
      status,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  )
}

/**
 * Validates user input and sanitizes it
 * @param {Object} data - Input data to validate
 * @param {Array} requiredFields - Array of required field names
 * @throws {Error} If validation fails
 */
export function validateInput(data, requiredFields = []) {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid input data')
  }

  for (const field of requiredFields) {
    if (!data[field]) {
      throw new Error(`Missing required field: ${field}`)
    }
  }
}

/**
 * Handles common authentication patterns and provides consistent error responses
 * @param {Function} handler - The actual API handler function
 * @param {Object} options - Options object
 * @param {boolean} options.requireAdmin - Whether admin access is required
 * @param {Array} options.requiredFields - Required input fields
 * @returns {Function} Wrapped handler function
 */
export function withAuth(handler, { requireAdmin = false, requiredFields = [] } = {}) {
  return async (request) => {
    try {
      // Create Supabase client with auth
      const supabase = createSupabaseClientWithAuth(request)

      // Validate input if required fields are specified
      const body = await request.json().catch(() => ({}))
      validateInput(body, requiredFields)

      // Check authentication requirements
      if (requireAdmin) {
        await requireAdmin(supabase)
      } else {
        await requireAuth(supabase)
      }

      // Execute the actual handler
      return await handler(request, supabase, body)

    } catch (error) {
      console.error('Authentication error:', error)

      // Return standardized error response
      const status = error.message.includes('required') ? 401 :
                    error.message.includes('Admin') ? 403 : 500

      return createAuthError(error.message, status)
    }
  }
}