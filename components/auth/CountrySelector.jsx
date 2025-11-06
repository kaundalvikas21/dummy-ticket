"use client"

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { countries } from '@/lib/countries'

export function CountrySelector({ value, onChange, className = '' }) {
  const [isOpen, setIsOpen] = useState(false)
  const selectedCountry = countries.find(country => country.code === value)

  const handleSelect = (country) => {
    onChange(country.code)
    setIsOpen(false)
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
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">
            {selectedCountry ? getCountryFlag(selectedCountry.code) : '🌍'}
          </span>
          <span className="text-sm text-gray-700">
            {selectedCountry ? selectedCountry.name : 'Select Country'}
          </span>
          {selectedCountry && (
            <span className="text-xs text-gray-500">
              ({selectedCountry.dialCode})
            </span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${
          isOpen ? 'transform rotate-180' : ''
        }`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <div className="p-1">
            {countries.map((country) => (
              <button
                key={country.code}
                type="button"
                onClick={() => handleSelect(country)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-gray-50 transition-colors ${
                  selectedCountry?.code === country.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                }`}
              >
                <span className="text-lg">{getCountryFlag(country.code)}</span>
                <div className="flex-1 text-left">
                  <div className="font-medium">{country.name}</div>
                  <div className="text-xs text-gray-500">{country.dialCode}</div>
                </div>
                {selectedCountry?.code === country.code && (
                  <span className="text-blue-600">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}