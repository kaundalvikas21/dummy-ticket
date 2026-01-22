'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'

/**
 * Error Boundary - Catches runtime errors in segments
 * This keeps your layout intact while showing error UI
 *
 * @param {Error} error - The error that was thrown
 * @param {() => void} reset - Function to reset the error boundary
 */
export default function Error({ error, reset }) {
  useEffect(() => {
    // Log error to console (can be replaced with Sentry/monitoring later)
    console.error('Error boundary caught:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="p-4 bg-red-100 rounded-full">
            <AlertCircle className="h-12 w-12 text-red-600" />
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-2xl font-bold text-gray-900">
          Something went wrong
        </h1>

        <p className="text-gray-600">
          We encountered an unexpected error. Don't worry, your data is safe.
        </p>

        {/* Error Details (dev only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="p-4 bg-red-50 rounded-lg text-left">
            <p className="text-sm font-mono text-red-800 break-words">
              {error.message}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}
