"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function TextInput({
  label,
  icon: Icon,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  error,
  ...props
}) {
  return (
    <div className="space-y-2">
      {label && (
        <Label className="text-xs md:text-sm font-semibold text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}

      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 z-10" />
        )}

        <Input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${Icon ? "pl-10 md:pl-11" : ""} ${error ? "border-red-500" : ""}`}
          required={required}
          {...props}
        />
      </div>

      {error && (
        <p className="text-[14px] text-red-500 mt-1">{error}</p>
      )}
    </div>
  )
}