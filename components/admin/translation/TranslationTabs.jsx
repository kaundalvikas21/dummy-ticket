"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs"
import { LOCALES, DEFAULT_LOCALE } from "@/lib/locales"
import { FlagIcon } from "@/components/ui/flag-icon"

export function TranslationTabs({
  activeLocale,
  onLocaleChange,
  children,
  className = ""
}) {
  const handleTabChange = (value) => {
    onLocaleChange(value)
  }

  return (
    <Tabs value={activeLocale} onValueChange={handleTabChange} className={className}>
      <TabsList className="grid w-full grid-cols-5 h-auto">
        {Object.entries(LOCALES).map(([code, locale]) => (
          <TabsTrigger
            key={code}
            value={code}
            className="flex items-center gap-2 px-3 py-2 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <FlagIcon
              src={locale.flag}
              alt={locale.name}
              countryCode={locale.countryCode}
              size={16}
              className="shrink-0"
            />
            <span className="hidden sm:inline text-xs font-medium">
              {code.toUpperCase()}
            </span>
            {code === DEFAULT_LOCALE && (
              <span className="text-xs text-blue-600 font-medium">(Default)</span>
            )}
          </TabsTrigger>
        ))}
      </TabsList>

      {Object.entries(LOCALES).map(([code, locale]) => (
        <TabsContent key={code} value={code} className="mt-0">
          {children({ locale: code, localeName: locale.name, isDefault: code === DEFAULT_LOCALE })}
        </TabsContent>
      ))}
    </Tabs>
  )
}