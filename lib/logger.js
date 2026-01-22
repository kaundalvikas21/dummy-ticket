/**
 * Smart logging utility for Next.js applications
 *
 * Features:
 * - Full logging in development for debugging
 * - Minimal logging in production for performance
 * - Structured format with log levels
 * - Easy migration from console.log
 *
 * @example
 * import logger from '@/lib/logger'
 *
 * // These only log in development
 * logger.debug('User data:', user)
 * logger.info('Payment successful')
 *
 * // These always log (even in production)
 * logger.warn('Rate limit exceeded')
 * logger.error('Database connection failed', error)
 *
 * @module lib/logger
 */

const isDevelopment = process.env.NODE_ENV === 'development'

const logger = {
  /**
   * Log debug messages (development only)
   * Use for detailed debugging information
   *
   * @param {...any} args - Arguments to log
   */
  debug: (...args) => {
    if (isDevelopment) {
      console.log('[DEBUG]', new Date().toISOString(), ...args)
    }
  },

  /**
   * Log info messages (development only)
   * Use for general informational messages
   *
   * @param {...any} args - Arguments to log
   */
  info: (...args) => {
    if (isDevelopment) {
      console.info('[INFO]', new Date().toISOString(), ...args)
    }
  },

  /**
   * Log warnings (always enabled)
   * Use for important warnings that should be monitored
   *
   * @param {...any} args - Arguments to log
   */
  warn: (...args) => {
    console.warn('[WARN]', new Date().toISOString(), ...args)
  },

  /**
   * Log errors (always enabled)
   * Use for errors and exceptions
   *
   * @param {...any} args - Arguments to log
   */
  error: (...args) => {
    console.error('[ERROR]', new Date().toISOString(), ...args)
  },

  /**
   * Check if debug logging is enabled
   *
   * @returns {boolean} True if in development mode
   */
  isDebugEnabled: () => isDevelopment
}

export default logger
