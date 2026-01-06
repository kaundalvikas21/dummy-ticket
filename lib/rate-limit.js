/**
 * Simple in-memory rate limiter for Next.js API routes
 *
 * For production with multiple server instances, consider using:
 * - Redis (upstash, redis.io)
 * - Vercel KV
 * - CloudFlare KV
 *
 * @module lib/rate-limit
 */

const rateLimitMap = new Map()

/**
 * Check if a request should be rate limited
 *
 * @param {string} identifier - IP address or user ID to rate limit
 * @param {number} limit - Max requests allowed in the time window
 * @param {number} window - Time window in milliseconds
 * @returns {{ allowed: boolean, resetAt?: number, remaining: number }}
 *
 * @example
 * const result = checkRateLimit('192.168.1.1', 5, 60000)
 * if (!result.allowed) {
 *   // Rate limited - user can try again at result.resetAt
 * }
 */
export function checkRateLimit(identifier, limit = 5, window = 60000) {
  const now = Date.now()

  // Get existing requests for this identifier
  const userRequests = rateLimitMap.get(identifier) || []

  // Filter out requests outside the time window
  const recentRequests = userRequests.filter(time => now - time < window)

  // Calculate remaining requests
  const remaining = Math.max(0, limit - recentRequests.length)

  // Check if limit exceeded
  if (recentRequests.length >= limit) {
    // Find the oldest request that's still within the window
    const oldestRequest = recentRequests[0]
    return {
      allowed: false,
      resetAt: oldestRequest + window,
      remaining: 0
    }
  }

  // Add current request timestamp
  recentRequests.push(now)
  rateLimitMap.set(identifier, recentRequests)

  // Periodic cleanup of old entries to prevent memory leaks
  // Only run cleanup if map is getting large (>10000 entries)
  if (rateLimitMap.size > 10000) {
    cleanupOldEntries(now, window)
  }

  return {
    allowed: true,
    remaining: remaining - 1
  }
}

/**
 * Cleanup old entries from the rate limit map
 *
 * @param {number} now - Current timestamp
 * @param {number} window - Time window in milliseconds
 * @private
 */
function cleanupOldEntries(now, window) {
  let removedCount = 0

  for (const [key, requests] of rateLimitMap.entries()) {
    // Filter requests to only those within the window
    const validRequests = requests.filter(time => now - time < window)

    if (validRequests.length === 0) {
      // No valid requests, remove the entry entirely
      rateLimitMap.delete(key)
      removedCount++
    } else if (validRequests.length !== requests.length) {
      // Some requests expired, update with valid ones
      rateLimitMap.set(key, validRequests)
    }
  }

  if (removedCount > 0) {
    console.log(`[RateLimit] Cleaned up ${removedCount} expired entries`)
  }
}

/**
 * Extract client IP address from Next.js request
 * Handles various proxy configurations
 *
 * @param {Request} request - Next.js API request object
 * @returns {string} Client IP address
 */
export function getClientIP(request) {
  // Try various headers in order of preference
  const headers = [
    'x-forwarded-for',      // Standard proxy header
    'x-real-ip',            // Nginx
    'cf-connecting-ip',     // Cloudflare
    'x-client-ip',          // Some CDNs
    'true-client-ip'        // Akamai
  ]

  for (const header of headers) {
    const value = request.headers.get(header)
    if (value) {
      // x-forwarded-for can contain multiple IPs: "client, proxy1, proxy2"
      // Take the first one (original client)
      const ips = value.split(',').map(ip => ip.trim())
      return ips[0]
    }
  }

  // Fallback - should rarely happen
  return 'unknown'
}

/**
 * Higher-order function that adds rate limiting to an API route handler
 *
 * @param {Function} handler - The API route handler function
 * @param {Object} options - Rate limit options
 * @param {number} options.limit - Max requests allowed (default: 5)
 * @param {number} options.window - Time window in milliseconds (default: 60000 = 1 minute)
 * @param {Function} options.identifierGenerator - Custom function to generate identifier
 * @returns {Function} Rate-limited handler function
 *
 * @example
 * // Use defaults (5 requests per minute)
 * export const POST = withRateLimit(myHandler)
 *
 * @example
 * // Custom limits (10 requests per 5 minutes)
 * export const POST = withRateLimit(myHandler, {
 *   limit: 10,
 *   window: 300000
 * })
 *
 * @example
 * // Rate limit by user ID instead of IP
 * export const POST = withRateLimit(myHandler, {
 *   limit: 100,
 *   window: 60000,
 *   identifierGenerator: async (req) => {
 *     const user = await getCurrentUser(req)
 *     return user?.id || req.headers.get('x-forwarded-for')
 *   }
 * })
 */
export function withRateLimit(handler, options = {}) {
  const {
    limit = 5,
    window = 60000,
    identifierGenerator = getClientIP
  } = options

  return async (request) => {
    // Generate identifier (IP address by default, or custom)
    const identifier = await identifierGenerator(request)

    // Check rate limit
    const result = checkRateLimit(identifier, limit, window)

    if (!result.allowed) {
      // Calculate Retry-After header value
      const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000)
      const resetDate = new Date(result.resetAt)

      return new Response(
        JSON.stringify({
          success: false,
          error: 'Too many attempts. Please try again later.',
          retryAfter: retryAfter,
          resetAt: resetDate.toISOString()
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.floor(result.resetAt / 1000).toString()
          }
        }
      )
    }

    // Rate limit check passed - add headers to response and continue
    const response = await handler(request)

    // Add rate limit headers to successful responses
    if (response instanceof Response) {
      response.headers.set('X-RateLimit-Limit', limit.toString())
      response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
    }

    return response
  }
}

/**
 * Reset rate limit for a specific identifier
 * Useful for testing or administrative purposes
 *
 * @param {string} identifier - The identifier to reset
 */
export function resetRateLimit(identifier) {
  rateLimitMap.delete(identifier)
}

/**
 * Get current rate limit statistics
 * Useful for monitoring and debugging
 *
 * @returns {{ totalEntries: number, requestsPerEntry: Object }}
 */
export function getRateLimitStats() {
  const stats = {
    totalEntries: rateLimitMap.size,
    requestsPerEntry: {}
  }

  for (const [key, requests] of rateLimitMap.entries()) {
    stats.requestsPerEntry[key] = requests.length
  }

  return stats
}

/**
 * Clear all rate limit data
 * Useful for testing or emergency situations
 *
 * @warning This affects all users globally
 */
export function clearAllRateLimits() {
  rateLimitMap.clear()
}
