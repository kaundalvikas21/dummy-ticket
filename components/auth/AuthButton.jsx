"use client"

import { Button } from '@/components/ui/button'

export function AuthButton({
  children,
  isLoading = false,
  loadingText = 'Loading...',
  type = 'submit',
  disabled,
  ...props
}) {
  return (
    <Button
      type={type}
      className="w-full bg-gradient-to-r from-blue-600 to-teal-400 text-white hover:shadow-xl hover:shadow-blue-600/40 transition-all duration-300 transform hover:scale-[1.02] font-semibold py-3 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          {loadingText}
        </div>
      ) : (
        children
      )}
    </Button>
  )
}

export { AuthButton }