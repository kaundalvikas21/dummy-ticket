"use client"

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useLocale } from '@/contexts/locale-context'
import { FlagIcon } from '@/components/ui/flag-icon'

export function LocaleSelector() {
  const { locale, changeLocale, allLocales } = useLocale()
  const currentLocale = allLocales.find(l => l.code === locale)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 px-3 h-10 md:h-11 rounded-full border-gray-200 bg-white hover:bg-gray-50 hover:text-gray-900 shadow-sm transition-all"
        >
          <FlagIcon
            src={currentLocale?.flag}
            alt={currentLocale?.name}
            countryCode={currentLocale?.countryCode}
            size={20}
            className="rounded-sm object-cover shrink-0 shadow-xs"
          />
          <span className="text-sm font-semibold text-slate-700">
            {currentLocale?.code.toUpperCase()}
          </span>
          <ChevronDown className="w-4 h-4 text-slate-400 ml-0.5" strokeWidth={2} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {allLocales.map((localeInfo) => (
          <DropdownMenuItem
            key={localeInfo.code}
            onClick={() => changeLocale(localeInfo.code)}
            className={`flex items-center gap-3 cursor-pointer ${localeInfo.code === locale ? 'bg-blue-50 text-blue-700' : ''
              }`}
          >
            <FlagIcon
              src={localeInfo.flag}
              alt={localeInfo.name}
              countryCode={localeInfo.countryCode}
              size={20}
              className="shrink-0"
            />
            <div className="flex-1">
              <div className="font-medium text-sm">{localeInfo.name}</div>
              <div className="text-xs text-muted-foreground">
                {localeInfo.code.toUpperCase()}
              </div>
            </div>
            {localeInfo.code === locale && (
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}