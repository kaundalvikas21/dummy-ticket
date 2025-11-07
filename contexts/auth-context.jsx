"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'

const AuthContext = createContext({
  user: null,
  profile: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  updateProfile: async () => {},
  isAuthenticated: false,
  isAdmin: false,
  isVendor: false,
  isUser: false,
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    checkAuth()
  }, [])

  // Listen for global logout events
  useEffect(() => {
    const handleGlobalLogout = () => {
      setUser(null)
      setProfile(null)
      localStorage.removeItem('auth_user')
      localStorage.removeItem('auth_profile')

      // Clear cookies
      document.cookie = 'auth_user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
      document.cookie = 'auth_profile=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    }

    window.addEventListener('auth-logout', handleGlobalLogout)

    return () => {
      window.removeEventListener('auth-logout', handleGlobalLogout)
    }
  }, [])

  const checkAuth = async () => {
    try {
      // Check if user is stored in localStorage
      const storedUser = localStorage.getItem('auth_user')
      const storedProfile = localStorage.getItem('auth_profile')

      if (storedUser && storedProfile) {
        const userData = JSON.parse(storedUser)
        const profileData = JSON.parse(storedProfile)

        setUser(userData)

        // Try to fetch fresh profile data from database to ensure we have complete data
        try {
          const response = await fetch(`/api/auth/profile?userId=${userData.id}`)

          if (response.ok) {
            const result = await response.json()
            if (result.success) {
              // Use fresh data from database
              setProfile(result.profile)

              // Update user data with created_at
              if (result.user?.created_at) {
                setUser(prevUser => ({ ...prevUser, created_at: result.user.created_at }))
              }

              // Update localStorage with fresh essential data
              const essentialProfileData = {
                id: result.profile.id,
                first_name: result.profile.first_name,
                last_name: result.profile.last_name,
                email: result.profile.email,
                role: result.profile.role,
                status: result.profile.status,
                date_of_birth: result.profile.date_of_birth,
                avatar_url: result.profile.avatar_url
              }

              try {
                localStorage.setItem('auth_profile', JSON.stringify(essentialProfileData))
              } catch (error) {
                console.error('localStorage quota exceeded during checkAuth:', error)
                localStorage.removeItem('auth_profile')
                localStorage.setItem('auth_profile', JSON.stringify(essentialProfileData))
              }
            } else {
              // Fallback to stored data if API fails
              setProfile(profileData)
            }
          } else {
            // Fallback to stored data if API fails
            setProfile(profileData)
          }
        } catch (error) {
          console.error('Failed to fetch fresh profile data:', error)
          // Fallback to stored data if API fails
          setProfile(profileData)
        }
      }
    } catch (error) {
      console.error('Auth check error:', error)
      // Clear invalid stored data
      localStorage.removeItem('auth_user')
      localStorage.removeItem('auth_profile')
      setUser(null)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      // For now, we'll use a simple API call since we're not using Supabase Auth
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Login failed')
      }

      const data = await response.json()

      // Store user data in state and localStorage
      setUser(data.user)
      setProfile(data.profile)

      localStorage.setItem('auth_user', JSON.stringify(data.user))

      // Store only essential profile data in localStorage
      const essentialProfileData = {
        id: data.profile.id,
        first_name: data.profile.first_name,
        last_name: data.profile.last_name,
        email: data.user.email,
        role: data.profile.role,
        status: data.profile.status,
        date_of_birth: data.profile.date_of_birth,
        avatar_url: data.profile.avatar_url
      }

      try {
        localStorage.setItem('auth_profile', JSON.stringify(essentialProfileData))
      } catch (error) {
        console.error('localStorage quota exceeded during login:', error)
        localStorage.removeItem('auth_profile')
        localStorage.setItem('auth_profile', JSON.stringify(essentialProfileData))
      }

      // Set cookies for middleware access with minimal data
      const userCookieData = {
        id: data.user.id,
        email: data.user.email,
        role: data.user.role
      }

      document.cookie = `auth_user=${JSON.stringify(userCookieData)}; path=/; max-age=${60 * 60 * 24 * 7}` // 7 days
      document.cookie = `auth_profile=${JSON.stringify(essentialProfileData)}; path=/; max-age=${60 * 60 * 24 * 7}` // 7 days

      return { success: true, data }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: error.message }
    }
  }

  const logout = async () => {
    try {
      // Call logout API endpoint for server-side cleanup
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Server logout failed')
      }

      // Clear user data from state and localStorage
      setUser(null)
      setProfile(null)
      localStorage.removeItem('auth_user')
      localStorage.removeItem('auth_profile')

      // Clear cookies
      document.cookie = 'auth_user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
      document.cookie = 'auth_profile=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'

      // Dispatch custom event for global logout sync
      window.dispatchEvent(new CustomEvent('auth-logout', {
        detail: { timestamp: Date.now() }
      }))

      return { success: true }
    } catch (error) {
      console.error('Logout error:', error)
      return { success: false, error: error.message }
    }
  }

  const register = async (userData) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Registration failed')
      }

      const result = await response.json()

      if (result.success) {
        // Auto-login after successful registration using returned data
        setUser(result.user)
        setProfile(result.profile)

        localStorage.setItem('auth_user', JSON.stringify(result.user))

        // Store only essential profile data in localStorage
        const essentialProfileData = {
          id: result.profile.id,
          first_name: result.profile.first_name,
          last_name: result.profile.last_name,
          email: result.user.email,
          role: result.profile.role,
          status: result.profile.status,
          date_of_birth: result.profile.date_of_birth,
          avatar_url: result.profile.avatar_url
        }

        try {
          localStorage.setItem('auth_profile', JSON.stringify(essentialProfileData))
        } catch (error) {
          console.error('localStorage quota exceeded during registration:', error)
          localStorage.removeItem('auth_profile')
          localStorage.setItem('auth_profile', JSON.stringify(essentialProfileData))
        }

        // Set cookies for middleware access with minimal data
        const userCookieData = {
          id: result.user.id,
          email: result.user.email,
          role: result.user.role
        }

        document.cookie = `auth_user=${JSON.stringify(userCookieData)}; path=/; max-age=${60 * 60 * 24 * 7}` // 7 days
        document.cookie = `auth_profile=${JSON.stringify(essentialProfileData)}; path=/; max-age=${60 * 60 * 24 * 7}` // 7 days

        return { success: true, data: result }
      } else {
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, error: error.message }
    }
  }

  const updateProfile = async (profileData) => {
    try {
      // Get the current user ID
      if (!user?.id) {
        return { success: false, error: 'User not authenticated' }
      }

      // Add user ID to profile data
      const updatePayload = {
        userId: user.id,
        ...profileData
      }

      console.log('Sending profile update request:', {
        userId: user.id,
        payload: updatePayload
      })

      const response = await fetch('/api/auth/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Profile update API error:', {
          status: response.status,
          error: errorData
        })
        throw new Error(errorData.error || errorData.details || 'Profile update failed')
      }

      const result = await response.json()

      if (result.success) {
        // Update local state with the complete profile data
        const updatedProfile = {
          ...result.profile,
          // Add backward compatibility fields
          email: user.email,
          role: user.role,
          status: user.status
        }

        setProfile(updatedProfile)

        // Store only essential data in localStorage to avoid quota exceeded errors
        const essentialProfileData = {
          id: result.profile.id,
          first_name: result.profile.first_name,
          last_name: result.profile.last_name,
          email: user.email,
          role: user.role,
          status: user.status,
          date_of_birth: result.profile.date_of_birth,
          // Only store avatar URL, not the actual image data
          avatar_url: result.profile.avatar_url
        }

        try {
          localStorage.setItem('auth_profile', JSON.stringify(essentialProfileData))
        } catch (error) {
          console.error('localStorage quota exceeded, clearing old data:', error)
          // Clear old data and try again
          localStorage.removeItem('auth_profile')
          localStorage.setItem('auth_profile', JSON.stringify(essentialProfileData))
        }

        // Update cookies with minimal data only
        const cookieData = {
          id: result.profile.id,
          email: user.email,
          role: user.role
        }

        try {
          document.cookie = `auth_profile=${JSON.stringify(cookieData)}; path=/; max-age=${60 * 60 * 24 * 7}` // 7 days
        } catch (error) {
          console.error('Cookie storage failed:', error)
        }

        return { success: true, data: result }
      } else {
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error('Profile update error:', error)
      return { success: false, error: error.message }
    }
  }

  const value = {
    user,
    profile,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    isAdmin: profile?.role === 'admin',
    isVendor: profile?.role === 'vendor',
    isUser: profile?.role === 'user',
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}