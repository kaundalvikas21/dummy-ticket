import { Skeleton } from "./skeleton"
import { cn } from "@/lib/utils"
import { Plane } from "lucide-react"

export function Logo({
  size = 'md',
  showText = true,
  className = '',
  logo,
  loading
}) {
  const sizeClasses = {
    sm: 'h-8 w-auto',
    md: 'w-[120px] md:w-[160px] lg:w-[180px] h-auto',
    lg: 'w-[120px] md:w-[170px] lg:w-[180px] h-auto',
    xl: 'w-[120px] md:w-[220px] lg:w-[260px] h-auto'
  }

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10'
  }

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl md:text-3xl',
    lg: 'text-3xl md:text-4xl',
    xl: 'text-4xl md:text-5xl'
  }

  if (loading) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Skeleton className={cn("rounded", sizeClasses[size])} />
        {showText && <Skeleton className="h-6 w-24" />}
      </div>
    )
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {logo?.url ? (
        // When logo is uploaded, show only the logo image
        <img
          src={logo.url}
          alt={logo.alt_text || 'Company Logo'}
          className={cn("object-contain", sizeClasses[size])}
        />
      ) : (
        // When no logo, show only company name from backend (no icon)
        showText && (
          <span className={cn(
            "bg-linear-to-r from-[#0066FF] to-[#00D4AA] bg-clip-text text-transparent font-bold",
            textSizes[size]
          )}>
            {logo?.company_name || 'VisaFly'}
          </span>
        )
      )}
    </div>
  )
}