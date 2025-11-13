import { Skeleton } from "./skeleton"
import { cn } from "@/lib/utils"

export function SkeletonCard({
  className,
  children,
  ...props
}) {
  return (
    <div
      className={cn("border rounded-lg p-4 bg-white", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function SkeletonCardHeader() {
  return (
    <div className="flex items-center gap-3 mb-4">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  )
}

export function SkeletonCardContent() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/5" />
    </div>
  )
}

export function SkeletonCardFooter() {
  return (
    <div className="flex justify-between items-center pt-4 border-t">
      <Skeleton className="h-9 w-20" />
      <Skeleton className="h-9 w-16" />
    </div>
  )
}