"use client"

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'

export function FormField({
  id,
  label,
  type = 'text',
  placeholder,
  icon: Icon,
  error,
  showPasswordToggle = false,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false)
  const isPasswordType = type === 'password'

  return (
    <div className="space-y-1.5">
      <Label
        htmlFor={id}
        className="text-sm text-gray-700 font-medium"
      >
        {label}
      </Label>

      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-3 h-4 w-4 text-gray-400 flex items-center justify-center">
            <Icon className="h-4 w-4" />
          </div>
        )}

        <Input
          id={id}
          type={isPasswordType && showPassword ? 'text' : type}
          placeholder={placeholder}
          className={`pl-10 ${isPasswordType ? 'pr-12' : ''} ${error ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-600'
            }`}
          {...props}
        />

        {isPasswordType && showPasswordToggle && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-gray-400" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400" />
            )}
          </Button>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-500 mt-1.5 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  )
}

