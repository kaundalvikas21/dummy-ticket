'use client'

import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

/**
 * Global Error Boundary - Catches root-level errors
 * This replaces the entire root layout when critical errors occur
 *
 * @param {Error} error - The error that was thrown
 * @param {() => void} reset - Function to reset the error boundary
 */
export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
          <div className="max-w-md w-full text-center space-y-6">
            {/* Critical Error Icon */}
            <div className="flex justify-center">
              <div className="p-4 bg-red-900 rounded-full">
                <AlertTriangle className="h-12 w-12 text-red-200" />
              </div>
            </div>

            {/* Error Message */}
            <h1 className="text-2xl font-bold text-white">
              Application Error
            </h1>

            <p className="text-gray-300">
              A critical error occurred. Please refresh the page or contact support.
            </p>

            {/* Error Details (dev only) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="p-4 bg-red-900 rounded-lg text-left">
                <p className="text-sm font-mono text-red-200 break-words">
                  {error?.message || 'Unknown error'}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={reset}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Reload Page
              </button>

              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
