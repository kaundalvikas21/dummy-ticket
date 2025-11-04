"use client"

import { createContext, useContext, useState, useEffect } from 'react'
import { DEFAULT_LOCALE, LOCALES, isValidLocale } from '@/lib/locales'

const LocaleContext = createContext()

export function LocaleProvider({ children }) {
  const [locale, setLocale] = useState(DEFAULT_LOCALE)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize locale from localStorage or URL params
  useEffect(() => {
    const initializeLocale = () => {
      // Check URL params first
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search)
        const urlLocale = urlParams.get('locale')

        // Check localStorage
        const storedLocale = localStorage.getItem('locale')

        // Use URL locale, then stored locale, then default
        let selectedLocale = DEFAULT_LOCALE

        if (urlLocale && isValidLocale(urlLocale)) {
          selectedLocale = urlLocale
        } else if (storedLocale && isValidLocale(storedLocale)) {
          selectedLocale = storedLocale
        }

        setLocale(selectedLocale)
        setIsLoading(false)
      }
    }

    initializeLocale()
  }, [])

  // Update localStorage when locale changes
  useEffect(() => {
    if (!isLoading && typeof window !== 'undefined') {
      localStorage.setItem('locale', locale)

      // Update document language (but not direction to prevent layout reversion)
      document.documentElement.lang = locale
    }
  }, [locale, isLoading])

  const changeLocale = (newLocale) => {
    if (isValidLocale(newLocale)) {
      setLocale(newLocale)

      // Update URL params
      if (typeof window !== 'undefined') {
        const url = new URL(window.location)
        url.searchParams.set('locale', newLocale)
        window.history.replaceState({}, '', url.toString())
      }
    }
  }

  const value = {
    locale,
    changeLocale,
    isLoading,
    currentLocaleInfo: LOCALES[locale],
    allLocales: Object.entries(LOCALES).map(([code, info]) => ({
      code,
      ...info
    }))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0066FF]"></div>
      </div>
    )
  }

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const context = useContext(LocaleContext)
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider')
  }
  return context
}