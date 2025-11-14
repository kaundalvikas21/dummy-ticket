import { useContext, useEffect, useState } from 'react';
import { LocaleContext } from '../../contexts/locale-context';

// Import all translation files directly to avoid dynamic import issues
import enTranslations from '../../lang/en/homepage.json';
import frTranslations from '../../lang/fr/homepage.json';
import nlTranslations from '../../lang/nl/homepage.json';
import esTranslations from '../../lang/es/homepage.json';
import arTranslations from '../../lang/ar/homepage.json';

// Static mapping of translations
const translationFiles = {
  en: enTranslations,
  fr: frTranslations,
  nl: nlTranslations,
  es: esTranslations,
  ar: arTranslations,
};

// Cache for loaded translations - initialize with English as fallback
const translationCache = new Map([
  ['en', enTranslations]
]);

/**
 * Load translations for a specific locale
 */
async function loadTranslations(locale) {
  if (translationCache.has(locale)) {
    return translationCache.get(locale);
  }

  try {
    const loadedTranslations = translationFiles[locale] || translationFiles.en;
    translationCache.set(locale, loadedTranslations);
    return loadedTranslations;
  } catch (error) {
    console.warn(`Failed to load translations for locale: ${locale}`, error);
    // Fallback to English
    if (locale !== 'en') {
      return loadTranslations('en');
    }
    return {};
  }
}

/**
 * Synchronous load translations for server-side rendering
 */
function loadTranslationsSync(locale) {
  if (translationCache.has(locale)) {
    return translationCache.get(locale);
  }

  // Return the static translations immediately
  const loadedTranslations = translationFiles[locale] || translationFiles.en;
  translationCache.set(locale, loadedTranslations);
  return loadedTranslations;
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj, path) {
  const keys = path.split('.');
  let current = obj;

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return null;
    }
  }

  return current;
}

/**
 * Translation hook for components
 */
export function useTranslation() {
  const { locale } = useContext(LocaleContext);
  const [translations, setTranslations] = useState(() => loadTranslationsSync(locale));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadTranslationsData = async () => {
      try {
        const data = await loadTranslations(locale);
        if (isMounted) {
          setTranslations(data);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Failed to load translations:', error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadTranslationsData();

    return () => {
      isMounted = false;
    };
  }, [locale]);

  const t = (key, fallback = '') => {
    const value = getNestedValue(translations, key);

    if (value !== null) {
      return value;
    }

    // Fallback to English if current locale doesn't have the translation
    if (locale !== 'en' && translationCache.has('en')) {
      const englishTranslations = translationCache.get('en');
      const englishValue = getNestedValue(englishTranslations, key);
      if (englishValue !== null) {
        console.warn(`Missing translation for key "${key}" in locale "${locale}", using English fallback`);
        return englishValue;
      }
    }

    // If no translation found, return fallback or key
    console.warn(`Translation not found for key "${key}" in any locale`);
    return fallback || key;
  };

  return { t, locale, isLoading };
}

/**
 * Synchronous translation function for static text
 * Note: This requires translations to be preloaded
 */
export function getTranslation(key, locale, fallback = '') {
  if (translationCache.has(locale)) {
    const value = getNestedValue(translationCache.get(locale), key);
    if (value !== null) return value;
  }

  // Fallback to English
  if (locale !== 'en' && translationCache.has('en')) {
    const value = getNestedValue(translationCache.get('en'), key);
    if (value !== null) {
      console.warn(`Missing translation for key "${key}" in locale "${locale}", using English fallback`);
      return value;
    }
  }

  return fallback || key;
}

/**
 * Preload translations for better performance
 */
export async function preloadTranslations(locale) {
  await loadTranslations(locale);
}

/**
 * Check if RTL language
 */
export function isRTL(locale) {
  return locale === 'ar';
}

/**
 * Get text direction for locale
 */
export function getTextDirection(locale) {
  return isRTL(locale) ? 'rtl' : 'ltr';
}