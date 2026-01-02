"use client"

import { useCurrency } from '@/contexts/currency-context'
import { CURRENCY_SYMBOLS } from '@/lib/exchange-rate'
import { motion, AnimatePresence } from 'framer-motion'
import { Coins } from 'lucide-react'

export function CurrencyLoadingOverlay() {
    const { isConverting, currency } = useCurrency()

    const currencyNames = {
        USD: 'US Dollar',
        INR: 'Indian Rupee',
        AED: 'UAE Dirham',
        EUR: 'Euro',
        GBP: 'British Pound',
        CAD: 'Canadian Dollar',
        AUD: 'Australian Dollar',
        JPY: 'Japanese Yen',
        CNY: 'Chinese Yuan',
        SGD: 'Singapore Dollar',
        SAR: 'Saudi Riyal',
        NZD: 'New Zealand Dollar',
        KRW: 'South Korean Won',
        BRL: 'Brazilian Real',
        ZAR: 'South African Rand',
        MXN: 'Mexican Peso',
        THB: 'Thai Baht',
        RUB: 'Russian Ruble',
        HKD: 'Hong Kong Dollar'
    }

    return (
        <AnimatePresence>
            {isConverting && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-9999 flex items-center justify-center bg-black/20 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4 max-w-sm mx-4"
                    >
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                            className="w-16 h-16 rounded-full bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg"
                        >
                            <Coins className="w-8 h-8 text-white" />
                        </motion.div>

                        <div className="text-center">
                            <h3 className="text-lg font-bold text-gray-900 mb-1">
                                Converting Prices
                            </h3>
                            <p className="text-sm text-gray-600">
                                to <span className="font-semibold text-blue-600">{currencyNames[currency]}</span>
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                ({CURRENCY_SYMBOLS[currency]}) {currency}
                            </p>
                        </div>

                        <div className="flex gap-1.5">
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                                className="w-2 h-2 rounded-full bg-blue-500"
                            />
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                                className="w-2 h-2 rounded-full bg-blue-500"
                            />
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                                className="w-2 h-2 rounded-full bg-blue-500"
                            />
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
