"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'

const AuthContext = createContext({
  user: null,
  profile: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
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

  const checkAuth = async () => {
    try {
      // Check if user is stored in localStorage
      const storedUser = localStorage.getItem('auth_user')
      const storedProfile = localStorage.getItem('auth_profile')

      if (storedUser && storedProfile) {
        setUser(JSON.parse(storedUser))
        setProfile(JSON.parse(storedProfile))
      }
    } catch (error) {
      console.error('Auth check error:', error)
      // Clear invalid stored data
      localStorage.removeItem('auth_user')
      localStorage.removeItem('auth_profile')
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
      localStorage.setItem('auth_profile', JSON.stringify(data.profile))

      // Set cookies for middleware access
      document.cookie = `auth_user=${JSON.stringify(data.user)}; path=/; max-age=${60 * 60 * 24 * 7}` // 7 days
      document.cookie = `auth_profile=${JSON.stringify(data.profile)}; path=/; max-age=${60 * 60 * 24 * 7}` // 7 days

      return { success: true, data }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: error.message }
    }
  }

  const logout = async () => {
    try {
      // Clear user data from state and localStorage
      setUser(null)
      setProfile(null)
      localStorage.removeItem('auth_user')
      localStorage.removeItem('auth_profile')

      // Clear cookies
      document.cookie = 'auth_user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
      document.cookie = 'auth_profile=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const value = {
    user,
    profile,
    loading,
    login,
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