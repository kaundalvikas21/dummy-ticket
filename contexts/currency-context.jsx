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

export const CurrencyProvider = ({ children }) => {
    const [hasMounted, setHasMounted] = useState(false)
    const [currency, setCurrency] = useState('USD')
    const [rates, setRates] = useState(null)

    useEffect(() => {
        const initCurrency = async () => {
            setHasMounted(true)

            // Check localStorage first
            const saved = localStorage.getItem('selected-currency')
            if (saved && SUPPORTED_CURRENCIES.includes(saved)) {
                setCurrency(saved)
                return
            }

            // If no saved preference, detect from IP
            try {
                const token = process.env.NEXT_PUBLIC_IPINFO_TOKEN || '91287bf4fddcdf'
                const response = await fetch(`https://ipinfo.io/json?token=${token}`)
                const data = await response.json()
                const country = data.country

                let detected = 'USD'

                if (country === 'IN') {
                    detected = 'INR'
                } else if (country === 'AE') {
                    detected = 'AED'
                } else if (country === 'GB') {
                    detected = 'GBP'
                } else if (EUROZONE_COUNTRIES.includes(country)) {
                    detected = 'EUR'
                }

                if (SUPPORTED_CURRENCIES.includes(detected)) {
                    setCurrency(detected)
                }
            } catch (error) {
                console.error('Currency detection failed:', error)
                // Default to USD is already set
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

    const changeCurrency = useCallback((code) => {
        if (SUPPORTED_CURRENCIES.includes(code)) {
            setCurrency(code)
            localStorage.setItem('selected-currency', code)
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
        supportedCurrencies: SUPPORTED_CURRENCIES
    }

    return (
        <CurrencyContext.Provider value={value}>
            {children}
        </CurrencyContext.Provider>
    )
}
