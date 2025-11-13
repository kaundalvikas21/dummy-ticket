import { Skeleton } from "./skeleton"
import { cn } from "@/lib/utils"

export function SkeletonForm({ fields = 3, className }) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: fields }).map((_, i) => (
        <SkeletonFormField key={i} />
      ))}
    </div>
  )
}

export function SkeletonFormField() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-10 w-full" />
    </div>
  )
}

export function SkeletonFormText() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-24 w-full" />
    </div>
  )
}

export function SkeletonFormActions() {
  return (
    <div className="flex justify-end space-x-2 pt-4">
      <Skeleton className="h-10 w-20" />
      <Skeleton className="h-10 w-32" />
    </div>
  )
}

export function SkeletonRadioGroup({ options = 3 }) {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" />
      <div className="flex space-x-6">
        {Array.from({ length: options }).map((_, i) => (
          <div key={i} className="flex items-center space-x-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}