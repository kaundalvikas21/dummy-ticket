"use client"

import { useState, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronDown } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { countries } from "@/lib/countries"

export function PhoneInputSingle({
  value,
  onChange,
  label,
  required = false,
  placeholder = "+1234567890",
  error
}) {
  const [displayValue, setDisplayValue] = useState('')
  const [selectedCountryCode, setSelectedCountryCode] = useState('+1')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Group countries by dial code to avoid duplicates
  const countryCodeMap = new Map()

  countries.forEach(country => {
    if (!countryCodeMap.has(country.dialCode)) {
      countryCodeMap.set(country.dialCode, {
        value: country.dialCode,
        countries: [],
        primaryCode: country.code
      })
    }
    countryCodeMap.get(country.dialCode).countries.push(country)
    // Prioritize certain countries as primary
    if (country.code === 'US' && country.dialCode === '+1') {
      countryCodeMap.get(country.dialCode).primaryCode = country.code
    }
    if (country.code === 'GB' && country.dialCode === '+44') {
      countryCodeMap.get(country.dialCode).primaryCode = country.code
    }
  })

  // Convert map to array and sort
  const countryCodeOptions = Array.from(countryCodeMap.values()).map(option => {
    const primaryCountry = option.countries.find(c =>
      (option.value === '+1' && c.code === 'US') ||
      (option.value === '+44' && c.code === 'GB') ||
      option.countries.length === 1
    ) || option.countries[0]

    return {
      value: option.value,
      label: `${option.value} (${primaryCountry.code})`,
      primaryCode: option.primaryCode
    }
  }).sort((a, b) => {
    // Popular countries order
    const popularOrder = ['+1', '+91', '+44', '+86', '+81', '+49', '+33', '+55', '+52', '+61']
    const aIndex = popularOrder.indexOf(a.value)
    const bIndex = popularOrder.indexOf(b.value)

    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex
    if (aIndex !== -1) return -1
    if (bIndex !== -1) return 1

    return a.value.localeCompare(b.value)
  })

  useEffect(() => {
    if (value) {
      // Set country code from form value
      setSelectedCountryCode(value.countryCode || '+1')
      // Combine country code and phone number for display
      const combined = `${value.countryCode || ''}${value.phoneNumber || ''}`
      setDisplayValue(combined)
    }
  }, [value])

  const handleCountryCodeChange = (countryCode) => {
    setSelectedCountryCode(countryCode)
    setIsDropdownOpen(false)

    // Update display value with new country code
    const currentPhoneNumber = value?.phoneNumber || ''
    const newValue = `${countryCode}${currentPhoneNumber}`
    setDisplayValue(newValue)

    // Notify parent of change
    onChange({
      countryCode,
      phoneNumber: currentPhoneNumber
    })
  }

  const handlePhoneChange = (e) => {
    const phoneNumber = e.target.value.replace(/\D/g, '') // Only accept digits
    const newValue = `${selectedCountryCode}${phoneNumber}`
    setDisplayValue(newValue)

    onChange({
      countryCode: selectedCountryCode,
      phoneNumber
    })
  }

  const getCountryFlag = (code) => {
    const flagMap = {
      'US': '🇺🇸', 'GB': '🇬🇧', 'IN': '🇮🇳', 'CA': '🇨🇦',
      'AU': '🇦🇺', 'DE': '🇩🇪', 'FR': '🇫🇷', 'IT': '🇮🇹',
      'ES': '🇪🇸', 'JP': '🇯🇵', 'CN': '🇨🇳', 'BR': '🇧🇷',
      'MX': '🇲🇽', 'RU': '🇷🇺', 'KR': '🇰🇷', 'AE': '🇦🇪',
      'SA': '🇸🇦', 'SG': '🇸🇬', 'HK': '🇭🇰', 'NL': '🇳🇱'
    }
    return flagMap[code] || '🌍'
  }

  return (
    <div className="space-y-2">
      {label && (
        <Label className="text-xs md:text-sm font-semibold text-gray-700">
          {label}
        </Label>
      )}

      {/* Country Code Dropdown and Phone Input Container */}
      <div className="flex gap-2">
        {/* Country Code Dropdown */}
        <div className="relative">
          <Select
            value={selectedCountryCode}
            onValueChange={handleCountryCodeChange}
            open={isDropdownOpen}
            onOpenChange={setIsDropdownOpen}
          >
            <SelectTrigger className={`${error ? "border-red-500" : ""} w-32`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {countryCodeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Phone Number Input */}
        <div className="flex-1 relative">
          <Input
            type="tel"
            value={value?.phoneNumber || ''}
            onChange={handlePhoneChange}
            placeholder="Enter phone number"
            inputMode="numeric"
            pattern="[0-9]*"
            className={`text-sm md:text-base ${error ? "border-red-500" : ""}`}
          />
          {selectedCountryCode && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <span className="text-xs text-gray-400">
                {getCountryFlag(
                  countryCodeOptions.find(opt => opt.value === selectedCountryCode)?.primaryCode || 'US'
                )}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}

      {/* Helper Text */}
      <p className="text-xs text-gray-500">
        Select country code and enter your phone number
      </p>
    </div>
  )
}