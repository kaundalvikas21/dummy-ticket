"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getExchangeRates, CURRENCY_SYMBOLS } from '@/lib/exchange-rate'

const CurrencyContext = createContext()

export const useCurrency = () => {
    const context = useContext(CurrencyContext)
    if (!context) {
        throw new Error('useCurrency must be used within a CurrencyProvider')
    }
    return context
}

const SUPPORTED_CURRENCIES = [
    'USD', 'INR', 'AED', 'EUR', 'GBP',
    'CAD', 'AUD', 'JPY', 'CNY', 'SGD',
    'SAR', 'NZD', 'KRW', 'BRL', 'ZAR',
    'MXN', 'THB', 'RUB', 'HKD'
]
const EUROZONE_COUNTRIES = ['AT', 'BE', 'HR', 'CY', 'EE', 'FI', 'FR', 'DE', 'GR', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PT', 'SK', 'SI', 'ES']

// Map country codes to their primary currency
const COUNTRY_TO_CURRENCY = {
    IN: 'INR',
    AE: 'AED',
    GB: 'GBP',
    CA: 'CAD',
    AU: 'AUD',
    JP: 'JPY',
    CN: 'CNY',
    SG: 'SGD',
    SA: 'SAR',
    NZ: 'NZD',
    KR: 'KRW',
    BR: 'BRL',
    ZA: 'ZAR',
    MX: 'MXN',
    TH: 'THB',
    RU: 'RUB',
    HK: 'HKD',
    US: 'USD'
}

export const CurrencyProvider = ({ children }) => {
    const [hasMounted, setHasMounted] = useState(false)
    const [currency, setCurrency] = useState('USD')
    const [rates, setRates] = useState(null)
    const [isConverting, setIsConverting] = useState(false)

    useEffect(() => {
        const initCurrency = async () => {
            setHasMounted(true)

            const savedCurrency = localStorage.getItem('selected-currency')
            const lastCountry = localStorage.getItem('last-detected-country')

            try {
                const token = process.env.NEXT_PUBLIC_IPINFO_TOKEN || '91287bf4fddcdf'
                const response = await fetch(`https://ipinfo.io/json?token=${token}`)
                const data = await response.json()
                const country = data.country

                let detected = 'USD'
                if (COUNTRY_TO_CURRENCY[country]) {
                    detected = COUNTRY_TO_CURRENCY[country]
                } else if (EUROZONE_COUNTRIES.includes(country)) {
                    detected = 'EUR'
                }

                // Logic: If country changed (e.g. VPN), auto-switch currency.
                // If country is same, respect saved preference.
                if (country !== lastCountry) {
                    setCurrency(detected)
                    localStorage.setItem('selected-currency', detected)
                    localStorage.setItem('last-detected-country', country)
                } else if (savedCurrency && SUPPORTED_CURRENCIES.includes(savedCurrency)) {
                    setCurrency(savedCurrency)
                } else {
                    setCurrency(detected)
                }
            } catch (error) {
                console.error('Currency detection failed:', error)
                if (savedCurrency && SUPPORTED_CURRENCIES.includes(savedCurrency)) {
                    setCurrency(savedCurrency)
                }
            }
        }

        initCurrency()
    }, [])

    useEffect(() => {
        const fetchRates = async () => {
            try {
                const newRates = await getExchangeRates('USD')
                if (newRates) setRates(newRates)
            } catch (e) {
                console.error("Rates fetch error", e)
            }
        }
        fetchRates()
    }, [])

    const changeCurrency = useCallback(async (code) => {
        if (SUPPORTED_CURRENCIES.includes(code)) {
            setIsConverting(true)
            // Brief delay for smooth loading animation
            await new Promise(resolve => setTimeout(resolve, 300))
            setCurrency(code)
            localStorage.setItem('selected-currency', code)
            // Keep loading state a bit longer for visual feedback
            await new Promise(resolve => setTimeout(resolve, 200))
            setIsConverting(false)
        }
    }, [])

    const convert = useCallback((amount) => {
        if (!rates || currency === 'USD') return amount
        const rate = rates[currency]
        return rate ? amount * rate : amount
    }, [rates, currency])

    const formatPrice = useCallback((amount, showSymbol = true) => {
        const currentCurrency = hasMounted ? currency : 'USD'
        const converted = convert(amount)
        const symbol = CURRENCY_SYMBOLS[currentCurrency] || '$'

        let formatted;
        if (currentCurrency === 'GBP') {
            formatted = converted.toFixed(2)
        } else {
            formatted = Math.round(converted).toLocaleString()
        }

        return showSymbol ? `${symbol}${formatted}` : formatted
    }, [convert, currency, hasMounted])

    const value = {
        currency: hasMounted ? currency : 'USD',
        rates,
        changeCurrency,
        convert,
        formatPrice,
        symbol: CURRENCY_SYMBOLS[hasMounted ? currency : 'USD'] || '$',
        supportedCurrencies: SUPPORTED_CURRENCIES,
        isConverting
    }

    return (
        <CurrencyContext.Provider value={value}>
            {children}
        </CurrencyContext.Provider>
    )
}
