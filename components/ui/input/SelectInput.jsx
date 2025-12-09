"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

export function SelectInput({
  label,
  icon: Icon,
  value,
  onChange,
  options,
  required = false,
  placeholder = "Select an option",
  error,
  ...props
}) {
  return (
    <div className="space-y-2">
      {label && (
        <Label className="text-xs md:text-sm font-semibold text-gray-700">
          {label}
        </Label>
      )}

      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 z-10 pointer-events-none" />
        )}

        <Select value={value} onValueChange={onChange} {...props}>
          <SelectTrigger className={`${Icon ? "pl-10 md:pl-11" : ""} ${error ? "border-red-500" : ""}`}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && (
        <p className="text-[14px] text-red-500 mt-1">{error}</p>
      )}
    </div>
  )
}