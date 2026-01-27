"use client"

import { useCurrency } from '@/contexts/currency-context'
import { CURRENCY_SYMBOLS } from '@/lib/exchange-rate'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { ChevronDown } from 'lucide-react'

export function CurrencySelector() {
    const { currency, changeCurrency, supportedCurrencies } = useCurrency()

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
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="flex items-center gap-2 px-3 h-10 md:h-11 rounded-full bg-white hover:bg-gray-50 hover:text-gray-900 transition-all"
                >
                    <span className="text-sm font-semibold text-[#00D4AA]">
                        {CURRENCY_SYMBOLS[currency]}
                    </span>
                    <span className="text-sm font-semibold text-slate-700">
                        {currency}
                    </span>
                    <ChevronDown className="w-4 h-4 text-slate-400 ml-0.5" strokeWidth={2} />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white/95 backdrop-blur-sm p-1 max-h-[300px] overflow-y-auto">
                {supportedCurrencies.map((code) => (
                    <DropdownMenuItem
                        key={code}
                        onClick={() => changeCurrency(code)}
                        className={`flex items-center gap-3 cursor-pointer ${code === currency ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'
                            }`}
                    >
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-sm text-gray-600">
                            {CURRENCY_SYMBOLS[code]}
                        </div>
                        <div className="flex-1">
                            <div className="font-medium text-sm">{currencyNames[code]}</div>
                            <div className="text-xs text-muted-foreground">
                                {code}
                            </div>
                        </div>
                        {code === currency && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
