"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Copy, Save } from "lucide-react"

export function ItemTranslationForm({
  itemId,
  locale,
  localeName,
  isDefault,
  initialQuestion = "",
  initialAnswer = "",
  onTranslationChange,
  onCopyFromDefault,
  className = ""
}) {
  const [question, setQuestion] = useState(initialQuestion)
  const [answer, setAnswer] = useState(initialAnswer)
  const [isSaving, setIsSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const handleQuestionChange = (value) => {
    setQuestion(value)
    checkForChanges(value, answer)
  }

  const handleAnswerChange = (value) => {
    setAnswer(value)
    checkForChanges(question, value)
  }

  const checkForChanges = (newQuestion, newAnswer) => {
    const questionChanged = newQuestion.trim() !== initialQuestion.trim()
    const answerChanged = newAnswer.trim() !== initialAnswer.trim()
    setHasUnsavedChanges(questionChanged || answerChanged)
  }

  const saveTranslation = async () => {
    if (!itemId || !locale || !question.trim() || !answer.trim()) {
      console.error('Cannot save translation: missing required fields')
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch(`/api/faq-page/items/${itemId}/translations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          locale,
          question: question.trim(),
          answer: answer.trim()
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setHasUnsavedChanges(false)
        onTranslationChange?.({
          locale,
          question: question.trim(),
          answer: answer.trim(),
          action: result.action
        })
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
  const canSave = question.trim() !== '' && answer.trim() !== ''

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor={`item-question-${locale}`} className="text-sm font-medium">
            Question {isDefault && <span className="text-blue-600">(Required)</span>}
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
        <Textarea
          id={`item-question-${locale}`}
          value={question}
          onChange={(e) => handleQuestionChange(e.target.value)}
          placeholder={isEnglish ? "Enter question..." : `Enter question in ${localeName}...`}
          className={isEnglish ? "font-medium min-h-[80px]" : "min-h-[80px]"}
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor={`item-answer-${locale}`} className="text-sm font-medium">
          Answer {isDefault && <span className="text-blue-600">(Required)</span>}
        </Label>
        <Textarea
          id={`item-answer-${locale}`}
          value={answer}
          onChange={(e) => handleAnswerChange(e.target.value)}
          placeholder={isEnglish ? "Enter answer..." : `Enter answer in ${localeName}...`}
          className={isEnglish ? "font-medium min-h-[120px]" : "min-h-[120px]"}
          rows={5}
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
          {!isSaving && !hasUnsavedChanges && question.trim() && answer.trim() && (
            <span className="text-green-600">Saved</span>
          )}
          {!canSave && (
            <span className="text-gray-400">Both question and answer are required</span>
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