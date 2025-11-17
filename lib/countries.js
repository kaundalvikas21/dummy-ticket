// This file defines country data, including dial codes, phone number formats, and validation patterns.
// It also provides utility functions for retrieving country information, formatting phone numbers, and validating them.
// This code is used in `components/auth/PhoneInput.jsx` for phone number input, formatting, and validation,
// and in `components/auth/CountrySelector.jsx` for displaying a list of countries.

export const countries = [
  {
    code: 'US',
    name: 'United States',
    dialCode: '+1',
    format: '(XXX) XXX-XXXX',
    pattern: /^\(\d{3}\) \d{3}-\d{4}$/
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    dialCode: '+44',
    format: 'XXXX XXXXXX',
    pattern: /^\d{4} \d{6}$/
  },
  {
    code: 'IN',
    name: 'India',
    dialCode: '+91',
    format: 'XXXXX-XXXXX',
    pattern: /^\d{5}-\d{5}$/
  },
  {
    code: 'CA',
    name: 'Canada',
    dialCode: '+1',
    format: '(XXX) XXX-XXXX',
    pattern: /^\(\d{3}\) \d{3}-\d{4}$/
  },
  {
    code: 'AU',
    name: 'Australia',
    dialCode: '+61',
    format: 'X XXXX XXXX',
    pattern: /^\d \d{4} \d{4}$/
  },
  {
    code: 'DE',
    name: 'Germany',
    dialCode: '+49',
    format: 'XXX XXXXXXX',
    pattern: /^\d{3} \d{7}$/
  },
  {
    code: 'FR',
    name: 'France',
    dialCode: '+33',
    format: 'X XX XX XX XX',
    pattern: /^\d \d{2} \d{2} \d{2} \d{2}$/
  },
  {
    code: 'IT',
    name: 'Italy',
    dialCode: '+39',
    format: 'XXX XXXXXXX',
    pattern: /^\d{3} \d{7}$/
  },
  {
    code: 'ES',
    name: 'Spain',
    dialCode: '+34',
    format: 'XXX XXX XXX',
    pattern: /^\d{3} \d{3} \d{3}$/
  },
  {
    code: 'JP',
    name: 'Japan',
    dialCode: '+81',
    format: 'XX-XXXX-XXXX',
    pattern: /^\d{2}-\d{4}-\d{4}$/
  },
  {
    code: 'CN',
    name: 'China',
    dialCode: '+86',
    format: 'XXX XXXX XXXX',
    pattern: /^\d{3} \d{4} \d{4}$/
  },
  {
    code: 'BR',
    name: 'Brazil',
    dialCode: '+55',
    format: '(XX) XXXXX-XXXX',
    pattern: /^\(\d{2}\) \d{5}-\d{4}$/
  },
  {
    code: 'MX',
    name: 'Mexico',
    dialCode: '+52',
    format: 'XXX XXX XXXX',
    pattern: /^\d{3} \d{3} \d{4}$/
  },
  {
    code: 'RU',
    name: 'Russia',
    dialCode: '+7',
    format: 'XXX XXX-XX-XX',
    pattern: /^\d{3} \d{3}-\d{2}-\d{2}$/
  },
  {
    code: 'KR',
    name: 'South Korea',
    dialCode: '+82',
    format: 'XX-XXXX-XXXX',
    pattern: /^\d{2}-\d{4}-\d{4}$/
  },
  {
    code: 'AE',
    name: 'United Arab Emirates',
    dialCode: '+971',
    format: 'XX XXX XXXX',
    pattern: /^\d{2} \d{3} \d{4}$/
  },
  {
    code: 'SA',
    name: 'Saudi Arabia',
    dialCode: '+966',
    format: 'XX XXX XXXX',
    pattern: /^\d{2} \d{3} \d{4}$/
  },
  {
    code: 'SG',
    name: 'Singapore',
    dialCode: '+65',
    format: 'XXXX XXXX',
    pattern: /^\d{4} \d{4}$/
  },
  {
    code: 'HK',
    name: 'Hong Kong',
    dialCode: '+852',
    format: 'XXXX XXXX',
    pattern: /^\d{4} \d{4}$/
  },
  {
    code: 'NL',
    name: 'Netherlands',
    dialCode: '+31',
    format: 'X XX XX XX XX',
    pattern: /^\d \d{2} \d{2} \d{2} \d{2}$/
  }
]

export function getCountryByCode(code) {
  return countries.find(country => country.code === code)
}

export function formatPhoneNumber(phoneNumber, countryCode) {
  const country = getCountryByCode(countryCode)
  if (!country) return phoneNumber

  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, '')

  // Basic formatting based on country
  switch (countryCode) {
    case 'US':
    case 'CA':
      if (digits.length === 10) {
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
      }
      break
    case 'GB':
      if (digits.length === 10) {
        return `${digits.slice(0, 4)} ${digits.slice(4)}`
      }
      break
    case 'IN':
      if (digits.length === 10) {
        return `${digits.slice(0, 5)}-${digits.slice(5)}`
      }
      break
    case 'AU':
      if (digits.length === 9) {
        return `${digits.slice(0, 1)} ${digits.slice(1, 5)} ${digits.slice(5)}`
      }
      break
    case 'DE':
    case 'IT':
      if (digits.length >= 8) {
        return `${digits.slice(0, 3)} ${digits.slice(3)}`
      }
      break
    case 'FR':
    case 'NL':
      if (digits.length === 9) {
        return `${digits.slice(0, 1)} ${digits.slice(1, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 7)} ${digits.slice(7)}`
      }
      break
    case 'ES':
      if (digits.length === 9) {
        return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
      }
      break
    case 'JP':
    case 'KR':
      if (digits.length >= 9) {
        return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6, 10)}`
      }
      break
    case 'CN':
      if (digits.length === 11) {
        return `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7)}`
      }
      break
    case 'BR':
      if (digits.length === 11) {
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
      }
      break
    case 'MX':
    case 'AE':
    case 'SA':
      if (digits.length >= 8) {
        return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 9)}`
      }
      break
    case 'RU':
      if (digits.length === 10) {
        return `${digits.slice(0, 3)} ${digits.slice(3, 6)}-${digits.slice(6, 8)}-${digits.slice(8)}`
      }
      break
    case 'SG':
    case 'HK':
      if (digits.length === 8) {
        return `${digits.slice(0, 4)} ${digits.slice(4)}`
      }
      break
    default:
      return phoneNumber
  }

  return phoneNumber
}

export function validatePhoneNumber(phoneNumber, countryCode) {
  const country = getCountryByCode(countryCode)
  if (!country) return { isValid: true }

  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, '')

  // Basic validation - check if length is reasonable
  const expectedLength = getExpectedPhoneLength(countryCode)
  const isValid = digits.length >= expectedLength - 2 && digits.length <= expectedLength + 2

  return { isValid, digits }
}

function getExpectedPhoneLength(countryCode) {
  const lengths = {
    'US': 10, 'CA': 10, 'GB': 10, 'IN': 10, 'AU': 9,
    'DE': 10, 'FR': 9, 'IT': 10, 'ES': 9, 'JP': 10,
    'CN': 11, 'BR': 11, 'MX': 10, 'RU': 10, 'KR': 10,
    'AE': 9, 'SA': 9, 'SG': 8, 'HK': 8, 'NL': 9
  }

  return lengths[countryCode] || 10
}
