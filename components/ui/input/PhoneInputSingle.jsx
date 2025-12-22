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
  icon: Icon,
  required = false,
  placeholder = "+1234567890",
  disabled = false,
  priorityCountryCode,
  error
}) {
  const [displayValue, setDisplayValue] = useState('')
  const [selectedIsoCode, setSelectedIsoCode] = useState('US')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Generate options for ALL countries keying by ISO code
  const countryCodeOptions = countries.map(country => ({
    value: country.code, // Use ISO code as value (e.g., 'US', 'CA')
    label: `${country.dialCode} (${country.code})`,
    dialCode: country.dialCode,
    primaryCode: country.code
  })).sort((a, b) => {
    // Popular countries order
    const popularOrder = ['US', 'IN', 'GB', 'CN', 'JP', 'DE', 'FR', 'BR', 'MX', 'AU', 'CA']
    const aIndex = popularOrder.indexOf(a.value)
    const bIndex = popularOrder.indexOf(b.value)

    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex
    if (aIndex !== -1) return -1
    if (bIndex !== -1) return 1

    return a.label.localeCompare(b.label)
  })

  // Helper to find ISO code for a dial code
  const findIsoForDialCode = (dialCode) => {
    // If we have a priority country for this dial code, return it
    if (priorityCountryCode) {
      const match = countries.find(c => c.dialCode === dialCode && c.code === priorityCountryCode)
      if (match) return match.code
    }

    // Otherwise return default primary for this dial code
    const defaultMatch = countries.find(c =>
      (dialCode === '+1' && c.code === 'US') ||
      (dialCode === '+44' && c.code === 'GB') ||
      c.dialCode === dialCode
    )
    return defaultMatch?.code || 'US'
  }

  // Sync state when props change
  useEffect(() => {
    if (value?.countryCode) {
      // Only update ISO if the current ISO doesn't match the new dial code
      // OR if priority country changed and matches the new dial code
      const currentCountry = countries.find(c => c.code === selectedIsoCode)

      if (currentCountry?.dialCode !== value.countryCode) {
        // Dial code changed externally, find best ISO matches
        setSelectedIsoCode(findIsoForDialCode(value.countryCode))
      } else if (priorityCountryCode && currentCountry?.code !== priorityCountryCode) {
        // Dial code matches, but priority country mandates a swap (e.g. US -> CA)
        // Only swap if the new priority country actually HAS this dial code
        const priorityMatch = countries.find(c => c.code === priorityCountryCode && c.dialCode === value.countryCode)
        if (priorityMatch) {
          setSelectedIsoCode(priorityCountryCode)
        }
      }

      // Combine country code and phone number for display
      const combined = `${value.countryCode || ''}${value.phoneNumber || ''}`
      setDisplayValue(combined)
    }
  }, [value, priorityCountryCode])

  const handleCountryChange = (isoCode) => {
    setSelectedIsoCode(isoCode)
    setIsDropdownOpen(false)

    const country = countries.find(c => c.code === isoCode)
    const newDialCode = country?.dialCode || '+1'

    // Update display value with new country code
    const currentPhoneNumber = value?.phoneNumber || ''
    const newValue = `${newDialCode}${currentPhoneNumber}`
    setDisplayValue(newValue)

    // Notify parent of change - sending dial code
    onChange({
      countryCode: newDialCode,
      phoneNumber: currentPhoneNumber
    })
  }

  const handlePhoneChange = (e) => {
    const phoneNumber = e.target.value.replace(/\D/g, '') // Only accept digits
    const country = countries.find(c => c.code === selectedIsoCode)
    const currentDialCode = country?.dialCode || '+1'

    const newValue = `${currentDialCode}${phoneNumber}`
    setDisplayValue(newValue)

    onChange({
      countryCode: currentDialCode,
      phoneNumber
    })
  }

  const getCountryFlag = (code) => {
    const flagMap = {
      'US': '🇺🇸', 'GB': '🇬🇧', 'IN': '🇮🇳', 'CA': '🇨🇦',
      'AU': '🇦🇺', 'DE': '🇩🇪', 'FR': '🇫🇷', 'IT': '🇮🇹',
      'ES': '🇪🇸', 'JP': '🇯🇵', 'CN': '🇨🇳', 'BR': '🇧🇷',
      'MX': '🇲🇽', 'RU': '🇷🇺', 'KR': '🇰🇷', 'AE': '🇦🇪',
      'SA': '🇸🇦', 'SG': '🇸🇬', 'HK': '🇭🇰', 'NL': '🇳🇱',
      'NZ': '🇳🇿', 'ZA': '🇿🇦', 'TH': '🇹🇭'
    }
    return flagMap[code] || '🌍'
  }

  return (
    <div className="space-y-1.5">
      {label && (
        <Label className="text-sm font-medium text-gray-700">
          {label}
        </Label>
      )}

      {/* Country Code Dropdown and Phone Input Container */}
      <div className="flex gap-2">
        {/* Country Code Dropdown - Compact width */}
        <div className="relative shrink-0">
          <Select
            value={selectedIsoCode}
            onValueChange={handleCountryChange}
            open={isDropdownOpen}
            onOpenChange={setIsDropdownOpen}
            disabled={disabled}
          >
            <SelectTrigger className={`${error ? "border-red-500" : ""} w-[112px]`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {countryCodeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Phone Number Input - Takes remaining space */}
        <div className="flex-1 relative min-w-0">
          {Icon && (
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 z-10 pointer-events-none" />
          )}
          <Input
            type="tel"
            value={value?.phoneNumber || ''}
            onChange={handlePhoneChange}
            placeholder="Enter phone number"
            inputMode="numeric"
            pattern="[0-9]*"
            className={`text-sm md:text-base w-full ${error ? "border-red-500" : ""} ${Icon ? "pl-10" : ""}`}
            disabled={disabled}
          />
          {selectedIsoCode && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <span className="text-xs text-gray-400">
                {getCountryFlag(selectedIsoCode)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  )
}