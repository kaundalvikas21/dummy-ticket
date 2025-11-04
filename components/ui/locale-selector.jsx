"use client"

import { useState } from 'react'
import { Globe, ChevronDown } from 'lucide-react'
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
          size="sm"
          className="flex items-center gap-2 px-3 py-2 h-auto"
        >
          <Globe className="w-4 h-4" />
          <span className="hidden sm:inline-flex items-center gap-2">
            <FlagIcon
              src={currentLocale?.flag}
              alt={currentLocale?.name}
              countryCode={currentLocale?.countryCode}
              size={16}
              className="shrink-0"
            />
            <span className="text-xs sm:text-sm font-medium">
              {currentLocale?.code.toUpperCase()}
            </span>
          </span>
          <ChevronDown className="w-3 h-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {allLocales.map((localeInfo) => (
          <DropdownMenuItem
            key={localeInfo.code}
            onClick={() => changeLocale(localeInfo.code)}
            className={`flex items-center gap-3 cursor-pointer ${
              localeInfo.code === locale ? 'bg-blue-50 text-blue-700' : ''
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