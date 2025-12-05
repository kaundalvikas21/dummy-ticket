"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CountryCodeSelect } from "@/components/ui/input/CountryCodeSelect"

export function PhoneInputWithCountry({
  label,
  countryCodeValue,
  phoneValue,
  onCountryCodeChange,
  onPhoneChange,
  countryError,
  phoneError,
  required = false,
  placeholder = "Enter phone number"
}) {
  const handlePhoneChange = (e) => {
    // Only accept digits
    const digits = e.target.value.replace(/\D/g, '')
    onPhoneChange(digits)
  }

  return (
    <div className="space-y-2">
      {label && (
        <Label className="text-xs md:text-sm font-semibold text-gray-700">
          {label}
        </Label>
      )}

      <div className="flex gap-2">
        {/* Country Code Select */}
        <CountryCodeSelect
          value={countryCodeValue}
          onChange={onCountryCodeChange}
          error={countryError}
          placeholder="+1"
        />

        {/* Phone Number Input */}
        <div className="flex-1 relative">
          <Input
            type="tel"
            value={phoneValue}
            onChange={handlePhoneChange}
            placeholder={placeholder}
            inputMode="numeric"
            pattern="[0-9]*"
            className={phoneError ? "border-red-500" : ""}
          />
        </div>
      </div>

      {/* Error Messages */}
      {countryError && (
        <p className="text-xs text-red-500 mt-1">{countryError}</p>
      )}
      {phoneError && (
        <p className="text-xs text-red-500 mt-1">{phoneError}</p>
      )}
    </div>
  )
}