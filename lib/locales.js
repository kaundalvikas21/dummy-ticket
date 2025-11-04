// Supported locales configuration
export const LOCALES = {
  en: {
    code: 'en',
    name: 'English',
    flag: 'https://flagcdn.com/w80/gb.png', // Larger UK flag for English
    countryCode: 'gb',
    direction: 'ltr',
  },
  fr: {
    code: 'fr',
    name: 'Français',
    flag: 'https://flagcdn.com/w80/fr.png',
    countryCode: 'fr',
    direction: 'ltr',
  },
  nl: {
    code: 'nl',
    name: 'Nederlands',
    flag: 'https://flagcdn.com/w80/nl.png',
    countryCode: 'nl',
    direction: 'ltr',
  },
  es: {
    code: 'es',
    name: 'Español',
    flag: 'https://flagcdn.com/w80/es.png',
    countryCode: 'es',
    direction: 'ltr',
  },
  ar: {
    code: 'ar',
    name: 'العربية',
    flag: 'https://flagcdn.com/w80/sa.png', // Larger Saudi flag for Arabic
    countryCode: 'sa',
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