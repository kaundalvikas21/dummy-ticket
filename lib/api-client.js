/**
 * Authenticated API Client for Supabase
 *
 * This client automatically adds JWT authentication headers to all API requests
 * and handles token refresh scenarios seamlessly.
 */

import { createClient } from '@/lib/supabase/client'

class AuthenticatedAPIClient {
  constructor() {
    this.supabase = createClient()
  }

  /**
   * Gets the current JWT token from Supabase session
   * @returns {Promise<string|null>} JWT access token or null if not authenticated
   */
  async getAuthToken() {
    try {
      const { data: { session }, error } = await this.supabase.auth.getSession()

      if (error) {
        console.error('Error getting auth session:', error)
        return null
      }

      if (!session?.access_token) {
        console.warn('No active auth session found')
        return null
      }

      return session.access_token
    } catch (error) {
      console.error('Unexpected error getting auth token:', error)
      return null
    }
  }

  /**
   * Creates authenticated headers for API requests
   * @returns {Promise<Object>} Headers object with Authorization and Content-Type
   */
  async createAuthHeaders() {
    const token = await this.getAuthToken()

    if (!token) {
      throw new Error('No authentication token available. User may not be logged in.')
    }

    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  /**
   * Makes an authenticated GET request
   * @param {string} url - API endpoint URL
   * @param {Object} options - Additional fetch options
   * @returns {Promise<Object>} Response data
   */
  async get(url, options = {}) {
    const headers = await this.createAuthHeaders()

    const response = await fetch(url, {
      method: 'GET',
      headers: { ...headers, ...options.headers },
      ...options
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`API Error (${response.status}): ${errorData.error || response.statusText}`)
    }

    return await response.json()
  }

  /**
   * Makes an authenticated POST request
   * @param {string} url - API endpoint URL
   * @param {Object|FormData} data - Request body data or FormData
   * @param {Object} options - Additional fetch options
   * @returns {Promise<Object>} Response data
   */
  async post(url, data = {}, options = {}) {
    const token = await this.getAuthToken()

    if (!token) {
      throw new Error('No authentication token available. User may not be logged in.')
    }

    // Handle FormData differently (for file uploads)
    const isFormData = data instanceof FormData

    const headers = {
      'Authorization': `Bearer ${token}`,
      ...options.headers
    }

    // Don't set Content-Type for FormData - browser sets it automatically with boundary
    if (!isFormData) {
      headers['Content-Type'] = 'application/json'
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: isFormData ? data : JSON.stringify(data),
      ...options
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`API Error (${response.status}): ${errorData.error || response.statusText}`)
    }

    return await response.json()
  }

  /**
   * Makes an authenticated PUT request
   * @param {string} url - API endpoint URL
   * @param {Object} data - Request body data
   * @param {Object} options - Additional fetch options
   * @returns {Promise<Object>} Response data
   */
  async put(url, data = {}, options = {}) {
    const headers = await this.createAuthHeaders()

    const response = await fetch(url, {
      method: 'PUT',
      headers: { ...headers, ...options.headers },
      body: JSON.stringify(data),
      ...options
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`API Error (${response.status}): ${errorData.error || response.statusText}`)
    }

    return await response.json()
  }

  /**
   * Makes an authenticated PATCH request
   * @param {string} url - API endpoint URL
   * @param {Object} data - Request body data
   * @param {Object} options - Additional fetch options
   * @returns {Promise<Object>} Response data
   */
  async patch(url, data = {}, options = {}) {
    const headers = await this.createAuthHeaders()

    const response = await fetch(url, {
      method: 'PATCH',
      headers: { ...headers, ...options.headers },
      body: JSON.stringify(data),
      ...options
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`API Error (${response.status}): ${errorData.error || response.statusText}`)
    }

    return await response.json()
  }

  /**
   * Makes an authenticated DELETE request
   * @param {string} url - API endpoint URL
   * @param {Object} options - Additional fetch options
   * @returns {Promise<Object>} Response data
   */
  async delete(url, options = {}) {
    const headers = await this.createAuthHeaders()

    const response = await fetch(url, {
      method: 'DELETE',
      headers: { ...headers, ...options.headers },
      ...options
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`API Error (${response.status}): ${errorData.error || response.statusText}`)
    }

    return await response.json()
  }

  /**
   * Utility method to check if user is authenticated
   * @returns {Promise<boolean>} True if user has valid session
   */
  async isAuthenticated() {
    const token = await this.getAuthToken()
    return token !== null
  }

  /**
   * Utility method to get current user info
   * @returns {Promise<Object|null>} Current user data or null
   */
  async getCurrentUser() {
    try {
      const { data, error } = await this.supabase.auth.getUser()
      const user = data?.user

      if (error) {
        console.error('Error getting current user:', error)
        return null
      }

      return user
    } catch (error) {
      console.error('Unexpected error getting current user:', error)
      return null
    }
  }
}

// Create and export singleton instance
export const apiClient = new AuthenticatedAPIClient()

// Export class for custom instances if needed
export { AuthenticatedAPIClient }

// Export convenience methods for direct usage
export const {
  get: authenticatedGet,
  post: authenticatedPost,
  put: authenticatedPut,
  patch: authenticatedPatch,
  delete: authenticatedDelete,
  isAuthenticated,
  getCurrentUser
} = apiClient