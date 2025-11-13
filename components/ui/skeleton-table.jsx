import { Skeleton } from "./skeleton"
import { cn } from "@/lib/utils"

export function SkeletonTable({ rows = 5, columns = 4, className }) {
  return (
    <div className={cn("w-full", className)}>
      {/* Header skeleton */}
      <div className="flex border-b pb-3 mb-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`header-${i}`} className="h-4 w-20 mr-4" />
        ))}
      </div>

      {/* Row skeletons */}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} className="flex items-center space-x-4 py-2 border-b">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton key={`cell-${rowIndex}-${colIndex}`} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonTableRow({ cells = 4, className }) {
  return (
    <div className={cn("flex items-center space-x-4 py-3 border-b", className)}>
      {Array.from({ length: cells }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
  )
}

export function SkeletonTableHeader({ columns = 4, className }) {
  return (
    <div className={cn("flex border-b pb-3 mb-4 space-x-4", className)}>
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-24" />
      ))}
    </div>
  )
}