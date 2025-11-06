"use client"

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle } from 'lucide-react'
import { countries, formatPhoneNumber, validatePhoneNumber } from '@/lib/countries'

export function PhoneInput({
  id,
  label,
  countryCode,
  phoneNumber,
  onCountryCodeChange,
  onPhoneNumberChange,
  error,
  className = ''
}) {
  const [formattedNumber, setFormattedNumber] = useState(phoneNumber || '')
  const [localError, setLocalError] = useState('')

  const selectedCountry = countries.find(country => country.code === countryCode)

  // Format phone number when country code or phone number changes
  useEffect(() => {
    if (phoneNumber && countryCode) {
      const formatted = formatPhoneNumber(phoneNumber, countryCode)
      setFormattedNumber(formatted)

      // Validate the phone number
      const validation = validatePhoneNumber(phoneNumber, countryCode)
      if (!validation.isValid) {
        setLocalError('Invalid phone number format')
      } else {
        setLocalError('')
      }
    } else {
      setFormattedNumber(phoneNumber || '')
      setLocalError('')
    }
  }, [phoneNumber, countryCode])

  const handleInputChange = (e) => {
    const value = e.target.value

    // Remove all non-digit characters for storage
    const digitsOnly = value.replace(/\D/g, '')

    setFormattedNumber(value)
    onPhoneNumberChange(digitsOnly)
  }

  const displayValue = countryCode && selectedCountry
    ? `${selectedCountry.dialCode} ${formattedNumber}`
    : formattedNumber

  return (
    <div className={`space-y-2.5 ${className}`}>
      <Label
        htmlFor={id}
        className="text-gray-700 font-medium"
      >
        {label}
      </Label>

      <div className="relative">
        {countryCode && selectedCountry && (
          <div className="absolute left-3 top-3 h-5 flex items-center text-gray-500 font-medium">
            {selectedCountry.dialCode}
          </div>
        )}

        <Input
          id={id}
          type="tel"
          placeholder={selectedCountry ? `${selectedCountry.dialCode} Phone number` : "Select country first"}
          value={displayValue}
          onChange={handleInputChange}
          className={`pl-20 ${error || localError ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-600'}`}
          disabled={!countryCode}
        />
      </div>

      {/* Display format helper */}
      {selectedCountry && (
        <p className="text-xs text-gray-500">
          Format: {selectedCountry.format}
        </p>
      )}

      {(error || localError) && (
        <p className="text-sm text-red-500 mt-1.5 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error || localError}
        </p>
      )}
    </div>
  )
}