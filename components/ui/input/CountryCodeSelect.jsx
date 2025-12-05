"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { countries } from "@/lib/countries"

export function CountryCodeSelect({
  value,
  onChange,
  error,
  placeholder = "Select",
  defaultValue = "+1"
}) {
  // Group countries by dial code to avoid duplicates
  const countryCodeMap = new Map()

  countries.forEach(country => {
    if (!countryCodeMap.has(country.dialCode)) {
      countryCodeMap.set(country.dialCode, {
        value: country.dialCode,
        countries: [],
        primaryFlag: getCountryFlag(country.code)
      })
    }
    countryCodeMap.get(country.dialCode).countries.push(country)
    // Prioritize certain countries as primary flag
    if (country.code === 'US' && country.dialCode === '+1') {
      countryCodeMap.get(country.dialCode).primaryFlag = getCountryFlag(country.code)
    }
    if (country.code === 'GB' && country.dialCode === '+44') {
      countryCodeMap.get(country.dialCode).primaryFlag = getCountryFlag(country.code)
    }
  })

  // Convert map to array and sort
  const countryCodeOptions = Array.from(countryCodeMap.values()).map(option => {
    // Show primary country first, then others if multiple
    const primaryCountry = option.countries.find(c =>
      (option.value === '+1' && c.code === 'US') ||
      (option.value === '+44' && c.code === 'GB') ||
      option.countries.length === 1
    ) || option.countries[0]

    return {
      value: option.value,
      label: `${option.value} (${primaryCountry.code})`,
      countries: option.countries
    }
  }).sort((a, b) => {
    // Popular countries order (most used first)
    const popularOrder = ['+1', '+91', '+44', '+86', '+81', '+49', '+33', '+81', '+55', '+52', '+61']
    const aIndex = popularOrder.indexOf(a.value)
    const bIndex = popularOrder.indexOf(b.value)

    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex
    if (aIndex !== -1) return -1
    if (bIndex !== -1) return 1

    return a.value.localeCompare(b.value)
  })

  return (
    <div className="space-y-2">
      <div className="relative">
        <Select
          value={value || defaultValue}
          onValueChange={onChange}
        >
          <SelectTrigger className={`${error ? "border-red-500" : ""} w-28`}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {countryCodeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  <span>{option.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

function getCountryFlag(code) {
  const flagMap = {
    'US': '🇺🇸', 'GB': '🇬🇧', 'IN': '🇮🇳', 'CA': '🇨🇦',
    'AU': '🇦🇺', 'DE': '🇩🇪', 'FR': '🇫🇷', 'IT': '🇮🇹',
    'ES': '🇪🇸', 'JP': '🇯🇵', 'CN': '🇨🇳', 'BR': '🇧🇷',
    'MX': '🇲🇽', 'RU': '🇷🇺', 'KR': '🇰🇷', 'AE': '🇦🇪',
    'SA': '🇸🇦', 'SG': '🇸🇬', 'HK': '🇭🇰', 'NL': '🇳🇱'
  }
  return flagMap[code] || '🌍'
}