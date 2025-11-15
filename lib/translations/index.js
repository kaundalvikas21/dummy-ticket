import { useContext, useEffect, useState } from 'react';
import { LocaleContext } from '../../contexts/locale-context';

// Import all translation files directly to avoid dynamic import issues
import enHomepageTranslations from '../../lang/en/homepage.json';
import frHomepageTranslations from '../../lang/fr/homepage.json';
import nlHomepageTranslations from '../../lang/nl/homepage.json';
import esHomepageTranslations from '../../lang/es/homepage.json';
import arHomepageTranslations from '../../lang/ar/homepage.json';

// Import page-specific translation files
import enBuyTicketTranslations from '../../lang/en/buy-ticket.json';
import frBuyTicketTranslations from '../../lang/fr/buy-ticket.json';
import nlBuyTicketTranslations from '../../lang/nl/buy-ticket.json';
import esBuyTicketTranslations from '../../lang/es/buy-ticket.json';
import arBuyTicketTranslations from '../../lang/ar/buy-ticket.json';

// Import services page translations
import enServicesTranslations from '../../lang/en/services.json';

// Import about page translations
import enAboutTranslations from '../../lang/en/about.json';
import frAboutTranslations from '../../lang/fr/about.json';
import nlAboutTranslations from '../../lang/nl/about.json';
import esAboutTranslations from '../../lang/es/about.json';
import arAboutTranslations from '../../lang/ar/about.json';

// Import contact page translations
import enContactTranslations from '../../lang/en/contact.json';
import frContactTranslations from '../../lang/fr/contact.json';
import nlContactTranslations from '../../lang/nl/contact.json';
import esContactTranslations from '../../lang/es/contact.json';
import arContactTranslations from '../../lang/ar/contact.json';

// Static mapping of translations with unique namespaces to avoid conflicts
const translationFiles = {
  en: {
    // Homepage translations
    homepage: enHomepageTranslations,
    // Buy ticket page translations with unique namespace
    buyTicket: enBuyTicketTranslations,
    // Services page translations
    services: enServicesTranslations,
    // About page translations
    about: enAboutTranslations,
    // Contact page translations
    contact: enContactTranslations,
  },
  fr: {
    homepage: frHomepageTranslations,
    buyTicket: frBuyTicketTranslations,
    // Services will use English as fallback for now
    services: enServicesTranslations,
    about: frAboutTranslations,
    contact: frContactTranslations,
  },
  nl: {
    homepage: nlHomepageTranslations,
    buyTicket: nlBuyTicketTranslations,
    services: enServicesTranslations,
    about: nlAboutTranslations,
    contact: nlContactTranslations,
  },
  es: {
    homepage: esHomepageTranslations,
    buyTicket: esBuyTicketTranslations,
    services: enServicesTranslations,
    about: esAboutTranslations,
    contact: esContactTranslations,
  },
  ar: {
    homepage: arHomepageTranslations,
    buyTicket: arBuyTicketTranslations,
    services: enServicesTranslations,
    about: arAboutTranslations,
    contact: arContactTranslations,
  },
};


// Cache for loaded translations - initialize with English as fallback
const englishTranslations = {
  homepage: enHomepageTranslations,
  buyTicket: enBuyTicketTranslations,
  services: enServicesTranslations,
  about: enAboutTranslations,
  contact: enContactTranslations,
};
const translationCache = new Map([
  ['en', englishTranslations]
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