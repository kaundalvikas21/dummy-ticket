"use client"

import { useState, useEffect, useRef } from 'react'
import { Globe } from 'lucide-react'

export function FlagIcon({ src, alt, countryCode, size = 20, className = '' }) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const timeoutRef = useRef(null)

  const handleLoad = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsLoading(false)
    setHasError(false)
  }

  const handleError = () => {
    console.log(`Failed to load flag: ${src}`)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsLoading(false)
    setHasError(true)
  }

  // Reset loading state when src changes
  useEffect(() => {
    setIsLoading(true)
    setHasError(false)

    // Add timeout fallback in case image takes too long to load
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      console.log(`Flag loading timeout: ${src}`)
      setIsLoading(false)
    }, 3000) // 3 second timeout

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [src])

  // Fallback to globe icon if flag fails to load
  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 rounded ${className}`}
        style={{ width: size, height: size }}
      >
        <Globe size={size * 0.6} className="text-gray-400" />
      </div>
    )
  }

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <img
        src={src}
        alt={alt || `${countryCode} flag`}
        title={alt || `${countryCode} flag`}
        className={`rounded max-w-full h-full border border-gray-200 ${isLoading ? 'opacity-0' : 'opacity-100'
          } transition-opacity duration-200`}
        width={size}
        height={size}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          objectFit: 'cover',
          display: 'block'
        }}
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
      />

      {/* Loading skeleton that shows only initially */}
      {isLoading && (
        <div
          className="absolute inset-0 bg-gray-200 rounded animate-pulse"
          style={{ width: size, height: size }}
        />
      )}
    </div>
  )
}