// Supported locales configuration
export const LOCALES = {
  en: {
    code: 'en',
    name: 'English',
    flag: '🇬🇧',
    direction: 'ltr',
  },
  fr: {
    code: 'fr',
    name: 'Français',
    flag: '🇫🇷',
    direction: 'ltr',
  },
  nl: {
    code: 'nl',
    name: 'Nederlands',
    flag: '🇳🇱',
    direction: 'ltr',
  },
  es: {
    code: 'es',
    name: 'Español',
    flag: '🇪🇸',
    direction: 'ltr',
  },
  ar: {
    code: 'ar',
    name: 'العربية',
    flag: '🇸🇦',
    direction: 'rtl',
  },
}

// Default locale
export const DEFAULT_LOCALE = 'en'

// Helper functions
export const getLocaleInfo = (locale) => {
  return LOCALES[locale] || LOCALES[DEFAULT_LOCALE]
}

export const getSupportedLocales = () => {
  return Object.keys(LOCALES)
}

export const isValidLocale = (locale) => {
  return Object.keys(LOCALES).includes(locale)
}