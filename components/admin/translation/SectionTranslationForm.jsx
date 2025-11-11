"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Copy, Save } from "lucide-react"

export function SectionTranslationForm({
  sectionId,
  locale,
  localeName,
  isDefault,
  initialTitle = "",
  onTranslationChange,
  onCopyFromDefault,
  className = ""
}) {
  const [title, setTitle] = useState(initialTitle)
  const [isSaving, setIsSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const handleTitleChange = (value) => {
    setTitle(value)
    setHasUnsavedChanges(value.trim() !== initialTitle.trim())
  }

  const saveTranslation = async () => {
    if (!sectionId || !locale || !title.trim()) {
      console.error('Cannot save translation: missing required fields')
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch(`/api/faq-page/sections/${sectionId}/translations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          locale,
          title: title.trim()
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setHasUnsavedChanges(false)
        onTranslationChange?.({ locale, title: title.trim(), action: result.action })
      } else {
        console.error('Failed to save translation:', result.error)
      }
    } catch (error) {
      console.error('Error saving translation:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCopyFromDefault = () => {
    if (onCopyFromDefault) {
      onCopyFromDefault(locale)
    }
  }

  const isEnglish = locale === 'en'
  const canSave = title.trim() !== ''

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor={`section-title-${locale}`} className="text-sm font-medium">
            Section Title {isDefault && <span className="text-blue-600">(Required)</span>}
          </Label>
          {!isEnglish && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyFromDefault}
              className="flex items-center gap-1"
            >
              <Copy className="w-3 h-3" />
              Copy from English
            </Button>
          )}
        </div>
        <Input
          id={`section-title-${locale}`}
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder={isEnglish ? "Enter section title..." : `Enter title in ${localeName}...`}
          className={isEnglish ? "font-medium" : ""}
        />
      </div>

      {/* Save Button and Status */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">
          {isSaving && (
            <span className="text-blue-600 animate-pulse">Saving...</span>
          )}
          {!isSaving && hasUnsavedChanges && (
            <span>Unsaved changes</span>
          )}
          {!isSaving && !hasUnsavedChanges && title.trim() && (
            <span className="text-green-600">Saved</span>
          )}
        </div>

        <Button
          type="button"
          onClick={saveTranslation}
          disabled={!canSave || isSaving}
          variant={hasUnsavedChanges ? "default" : "outline"}
          size="sm"
          className="flex items-center gap-2"
        >
          <Save className="w-3 h-3" />
          {isSaving ? 'Saving...' : hasUnsavedChanges ? 'Save Changes' : 'Saved'}
        </Button>
      </div>
    </div>
  )
}