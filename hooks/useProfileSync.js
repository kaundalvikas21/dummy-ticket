"use client"

import { useEffect, useState, useCallback, useRef } from 'react'
import { useAuth } from '@/contexts/auth-context'

/**
 * Custom hook for automatic profile synchronization
 *
 * Provides automatic profile updates when profile data changes,
 * along with loading states and error handling.
 *
 * @returns {Object} Profile synchronization state and functions
 */
export function useProfileSync() {
  const {
    profile,
    profileVersion,
    loading: authLoading,
    refreshProfile,
    isAuthenticated
  } = useAuth()

  const [syncing, setSyncing] = useState(false)
  const [lastSyncError, setLastSyncError] = useState(null)
  const [syncCount, setSyncCount] = useState(0)

  // Track profile version changes
  const lastProfileVersion = useRef(profileVersion)

  // Automatic sync when profile version changes
  useEffect(() => {
    if (profileVersion !== lastProfileVersion.current) {
      console.log('Profile version changed, syncing...', {
        oldVersion: lastProfileVersion.current,
        newVersion: profileVersion
      })

      setSyncCount(prev => prev + 1)
      lastProfileVersion.current = profileVersion

      // Clear any previous sync errors on new version
      setLastSyncError(null)
    }
  }, [profileVersion])

  // Manual refresh function with error handling
  const manualRefresh = useCallback(async () => {
    if (!isAuthenticated) {
      setLastSyncError('User not authenticated')
      return { success: false, error: 'User not authenticated' }
    }

    setSyncing(true)
    setLastSyncError(null)

    try {
      const result = await refreshProfile()

      if (!result.success) {
        setLastSyncError(result.error)
      }

      return result
    } catch (error) {
      const errorMessage = error.message || 'Failed to refresh profile'
      setLastSyncError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setSyncing(false)
    }
  }, [isAuthenticated, refreshProfile])

  // Clear error function
  const clearError = useCallback(() => {
    setLastSyncError(null)
  }, [])

  // Check if profile is fresh (not stale)
  const isProfileFresh = syncCount > 0 && !syncing && !lastSyncError

  return {
    // Profile data
    profile,

    // Loading states
    loading: authLoading || syncing,
    syncing,

    // Version tracking
    profileVersion,
    syncCount,

    // State indicators
    isProfileFresh,
    hasSyncError: !!lastSyncError,
    lastSyncError,

    // Actions
    manualRefresh,
    clearError,

    // Convenience flags
    canRefresh: isAuthenticated && !syncing
  }
}