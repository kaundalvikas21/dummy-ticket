"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function ItemTranslationForm({
  itemId,
  locale,
  localeName,
  isDefault,
  initialQuestion = "",
  initialAnswer = "",
  currentTranslationData,
  onDataChange,
  className = ""
}) {
  const [question, setQuestion] = useState(initialQuestion)
  const [answer, setAnswer] = useState(initialAnswer)

  // Use current translation data if available, otherwise use initial data
  useEffect(() => {
    if (currentTranslationData && currentTranslationData[locale]) {
      setQuestion(currentTranslationData[locale].question || '')
      setAnswer(currentTranslationData[locale].answer || '')
    } else {
      setQuestion(initialQuestion)
      setAnswer(initialAnswer)
    }
  }, [locale, initialQuestion, initialAnswer, currentTranslationData])

  const handleQuestionChange = (value) => {
    const newQuestion = value
    setQuestion(newQuestion)

    // Notify parent component of data change for bulk saving
    if (onDataChange) {
      onDataChange({
        locale,
        question: newQuestion.trim(),
        answer: answer.trim(),
        hasContent: newQuestion.trim() !== '' && answer.trim() !== ''
      })
    }
  }

  const handleAnswerChange = (value) => {
    const newAnswer = value
    setAnswer(newAnswer)

    // Notify parent component of data change for bulk saving
    if (onDataChange) {
      onDataChange({
        locale,
        question: question.trim(),
        answer: newAnswer.trim(),
        hasContent: question.trim() !== '' && newAnswer.trim() !== ''
      })
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <Label htmlFor={`item-question-${locale}`} className="text-sm font-medium">
          Question {isDefault && <span className="text-blue-600">(Required)</span>}
        </Label>
        <Textarea
          id={`item-question-${locale}`}
          value={question}
          onChange={(e) => handleQuestionChange(e.target.value)}
          placeholder={isDefault ? "Enter question..." : `Enter question in ${localeName}...`}
          className={isDefault ? "font-medium min-h-[80px]" : "min-h-[80px]"}
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
          placeholder={isDefault ? "Enter answer..." : `Enter answer in ${localeName}...`}
          className={isDefault ? "font-medium min-h-[120px]" : "min-h-[120px]"}
          rows={5}
        />
      </div>
    </div>
  )
}