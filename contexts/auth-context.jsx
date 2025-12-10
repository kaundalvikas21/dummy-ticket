"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const AuthContext = createContext({
  user: null,
  profile: null,
  loading: true,
  profileVersion: 0,
  signIn: async () => { },
  signUp: async () => { },
  signOut: async () => { },
  updateProfile: async () => { },
  refreshProfile: async () => { },
  notifyProfileUpdate: () => { },
  getRedirectUrl: () => '/',
  isAuthenticated: false,
  isAdmin: false,
  isVendor: false,
  isUser: false,
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [profileVersion, setProfileVersion] = useState(0)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  // Check for existing session on mount
  useEffect(() => {
    checkAuth()
  }, [])

  // Listen for auth state changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        setUser(session.user)
        // Note: Profile is fetched by checkAuth(), avoiding race condition
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkAuth = async () => {
    try {
      // Get initial session
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        setUser(session.user)

        // Fetch user profile
        try {
          const response = await fetch('/api/auth/profile', {
            headers: {
              'Authorization': `Bearer ${session.access_token}`
            }
          })
          if (response.ok) {
            const result = await response.json()
            if (result.success) {
              setProfile(result.profile)
            }
          }
        } catch (error) {
          console.error('Failed to fetch profile:', error)
        }
      }
    } catch (error) {
      console.error('Auth check error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Supabase Auth methods
  const signIn = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Login failed')
      }

      // After successful login, set the user and profile from response
      if (result.success) {
        setUser(result.user)
        setProfile(result.profile)
      }

      return { success: true, data: result }
    } catch (error) {
      console.error('Sign in error:', error)
      return { success: false, error: error.message }
    }
  }

  const signUp = async (userData) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed')
      }

      // After successful registration, update state with user data
      if (result.success && result.user) {
        setUser(result.user)

        // Fetch profile data for the new user
        // Get current session (should now have the new user's token)
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.access_token) {
          try {
            const profileResponse = await fetch('/api/auth/profile', {
              headers: {
                'Authorization': `Bearer ${session.access_token}`
              }
            })
            if (profileResponse.ok) {
              const profileResult = await profileResponse.json()
              if (profileResult.success) {
                setProfile(profileResult.profile)
              }
            }
          } catch (profileError) {
            console.error('Failed to fetch profile after registration:', profileError)
          }
        }
      }

      return { success: true, data: result }
    } catch (error) {
      console.error('Sign up error:', error)
      return { success: false, error: error.message }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        throw new Error(error.message)
      }

      // The auth state change listener will handle clearing user and profile
      return { success: true }
    } catch (error) {
      console.error('Sign out error:', error)
      return { success: false, error: error.message }
    }
  }

  // Legacy methods for backward compatibility
  const login = signIn
  const register = signUp
  const logout = signOut

  // Refresh profile from database
  const refreshProfile = async () => {
    try {
      if (!user?.id) {
        console.warn('Cannot refresh profile: user not authenticated')
        return { success: false, error: 'User not authenticated' }
      }

      // Get current session
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        return { success: false, error: 'No valid authentication session' }
      }

      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to refresh profile')
      }

      const result = await response.json()
      if (result.success) {
        const refreshedProfile = {
          ...result.profile,
          email: user.email,
          // role: user.role, // Do not overwrite role from profile
          status: user.status
        }
        setProfile(refreshedProfile)
        setProfileVersion(prev => prev + 1)

        return { success: true, data: refreshedProfile }
      } else {
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error('Profile refresh error:', error)
      return { success: false, error: error.message }
    }
  }

  // Notify all components of profile update
  const notifyProfileUpdate = () => {
    setProfileVersion(prev => prev + 1)
  }

  const updateProfile = async (profileData) => {
    try {
      if (!user?.id) {
        return { success: false, error: 'User not authenticated' }
      }

      // Get current session to access JWT token
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        return { success: false, error: 'No valid authentication session' }
      }

      // Don't include userId in payload - use authenticated session instead
      const updatePayload = {
        ...profileData
      }

      const response = await fetch('/api/auth/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(updatePayload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || errorData.details || 'Profile update failed')
      }

      const result = await response.json()

      if (result.success) {
        // Refresh profile from database to ensure we have the latest data
        const refreshResult = await refreshProfile()

        return { success: true, data: result, refreshResult }
      } else {
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error('Profile update error:', error)
      return { success: false, error: error.message }
    }
  }

  // Helper function to get the appropriate redirect URL based on user role
  const getRedirectUrl = () => {
    if (profile?.role === 'admin') return '/admin'
    if (profile?.role === 'vendor') return '/vendor'
    if (profile?.role === 'user') return '/user'
    return '/' // Fallback to home page
  }

  const value = {
    user,
    profile,
    loading,
    profileVersion,
    // Supabase Auth methods
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshProfile,
    notifyProfileUpdate,
    getRedirectUrl,
    // Legacy methods for backward compatibility
    login,
    register,
    logout,
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