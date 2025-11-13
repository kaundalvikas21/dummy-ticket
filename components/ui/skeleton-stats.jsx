import { cn } from "@/lib/utils"

export function SkeletonStats({ count = 4, className }) {
  const gridCols = cn(
    count === 1 ? 'grid-cols-1' :
    count === 2 ? 'grid-cols-2 md:grid-cols-2' :
    count === 3 ? 'grid-cols-2 md:grid-cols-3' :
    count === 4 ? 'grid-cols-2 lg:grid-cols-4' :
    'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
  )

  return (
    <div
      className={cn(
        "grid gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto",
        gridCols,
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonStatsItem key={i} />
      ))}
    </div>
  )
}

export function SkeletonStatsItem() {
  return (
    <div className="text-center">
      {/* Icon skeleton */}
      <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gray-200 mb-3 md:mb-4" />

      {/* Value skeleton */}
      <div className="h-8 w-16 md:h-10 md:w-20 bg-gray-200 rounded mb-1 md:mb-2 mx-auto" />

      {/* Label skeleton */}
      <div className="h-4 w-24 md:h-5 md:w-32 bg-gray-200 rounded mx-auto" />
    </div>
  )
}