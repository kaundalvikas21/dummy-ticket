"use client"

import * as React from "react"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    return (
      <div className="relative flex items-center">
        <input
          type="checkbox"
          className={cn(
            "peer h-4 w-4 shrink-0 rounded-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600",
            className
          )}
          ref={ref}
          checked={checked}
          onChange={(e) => {
            if (onCheckedChange) {
              onCheckedChange(e.target.checked)
            }
            props?.onChange?.(e)
          }}
          {...props}
        />
        {checked && (
          <Check
            className="absolute top-0 left-0 h-4 w-4 shrink-0 text-white pointer-events-none"
          />
        )}
      </div>
    );
  }
)

Checkbox.displayName = "Checkbox";

export { Checkbox };