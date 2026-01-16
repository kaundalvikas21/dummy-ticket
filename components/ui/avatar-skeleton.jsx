import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

export function AvatarSkeleton({ className, ...props }) {
  return (
    <div className={cn("relative flex size-8 shrink-0 overflow-hidden rounded-full", className)}>
      <Skeleton className="size-full" {...props} />
    </div>
  )
}

export function AvatarFallbackSkeleton({ className, ...props }) {
  return (
    <div className={cn("bg-muted flex size-full items-center justify-center rounded-full", className)}>
      <Skeleton className="w-4 h-4 rounded-full" {...props} />
    </div>
  )
}
