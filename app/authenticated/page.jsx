"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'

export default function AuthenticatedRedirectPage() {
  const router = useRouter()
  const { user, profile, loading } = useAuth()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not authenticated, redirect to login
        router.push('/login')
      } else {
        // Authenticated, redirect to appropriate dashboard
        if (profile?.role === 'admin') {
          router.push('/admin')
        } else if (profile?.role === 'vendor') {
          router.push('/vendor')
        } else {
          // Default to user dashboard
          router.push('/user')
        }
      }
    }
  }, [user, profile, loading, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to your dashboard...</p>
      </div>
    </div>
  )
}