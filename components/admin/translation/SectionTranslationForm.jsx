"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export function SectionTranslationForm({
  sectionId,
  locale,
  localeName,
  isDefault,
  initialTitle = "",
  currentTranslationData,
  onDataChange,
  className = ""
}) {
  const [title, setTitle] = useState(initialTitle)

  // Use current translation data if available, otherwise use initial title
  useEffect(() => {
    if (currentTranslationData && currentTranslationData[locale]) {
      setTitle(currentTranslationData[locale].title || '')
    } else {
      setTitle(initialTitle)
    }
  }, [locale, initialTitle, currentTranslationData])

  const handleTitleChange = (value) => {
    const newTitle = value
    setTitle(newTitle)

    // Notify parent component of data change for bulk saving
    if (onDataChange) {
      onDataChange({
        locale,
        title: newTitle.trim(),
        hasContent: newTitle.trim() !== ''
      })
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <Label htmlFor={`section-title-${locale}`} className="text-sm font-medium">
          Section Title {isDefault && <span className="text-blue-600">(Required)</span>}
        </Label>
        <Input
          id={`section-title-${locale}`}
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder={isDefault ? "Enter section title..." : `Enter title in ${localeName}...`}
          className={isDefault ? "font-medium" : ""}
        />
      </div>
    </div>
  )
}