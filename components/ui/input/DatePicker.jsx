"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "@/components/ui/label"

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  disabled = false,
  className,
  label,
  required = false,
  disabledDate,
  captionLayout,
  fromYear,
  toYear,
  startMonth,
  endMonth,
  defaultMonth,
}) {
  const [date, setDate] = React.useState(value ? new Date(value) : undefined)

  // Update internal state when value prop changes
  React.useEffect(() => {
    setDate(value ? new Date(value) : undefined)
  }, [value])

  const handleSelect = (selectedDate) => {
    setDate(selectedDate)
    if (selectedDate) {
      // Format as YYYY-MM-DD for form data
      onChange(format(selectedDate, "yyyy-MM-dd"))
    } else {
      onChange("")
    }
  }

  return (
    <div className="space-y-2">
      {label && (
        <Label className="text-xs md:text-sm font-semibold text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal border-input",
              !date && "text-muted-foreground",
              disabled && "opacity-50 cursor-not-allowed bg-gray-50 border-gray-200",
              className
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        {!disabled && (
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleSelect}
              disabled={disabledDate}
              initialFocus
              captionLayout={captionLayout}
              startMonth={startMonth || (fromYear ? new Date(fromYear, 0) : undefined)}
              endMonth={endMonth || (toYear ? new Date(toYear, 11) : undefined)}
              defaultMonth={defaultMonth}
            />
          </PopoverContent>
        )}
      </Popover>
    </div>
  )
}
