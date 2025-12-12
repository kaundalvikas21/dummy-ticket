import { Skeleton } from "./skeleton"
import { cn } from "@/lib/utils"

export function FooterSkeleton({ className, ...props }) {
  return (
    <footer
      className={cn(
        "relative bg-gradient-to-br from-[#0a1628] via-[#0d1b2a] to-[#1b263b] text-white overflow-hidden",
        className
      )}
      {...props}
    >
      {/* Background elements matching footer */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#0066FF] rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#00D4AA] rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 py-8 md:py-16">
        {/* Header section skeleton */}
        <div className="mb-8 md:mb-12">
          {/* Logo/Company name skeleton */}
          <div className="flex w-fit items-center gap-4 text-2xl md:text-3xl font-bold mb-4 md:mb-6">
            <Skeleton className="h-10 md:h-14 lg:h-16 w-32 md:w-40 lg:w-48" />
          </div>

          {/* Description text skeleton */}
          <div className="mb-6 md:mb-8 max-w-3xl">
            <Skeleton className="h-4 md:h-5 lg:h-6 w-full mb-2 md:mb-3 bg-gray-300/20" />
            <Skeleton className="h-4 md:h-5 lg:h-6 w-5/6 mb-2 md:mb-3 bg-gray-300/20" />
            <Skeleton className="h-4 md:h-5 lg:h-6 w-4/6 bg-gray-300/20" />
          </div>

          {/* Address card skeleton */}
          <div className="max-w-md">
            <div className="flex items-start gap-3 bg-white/5 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-white/10">
              {/* Icon placeholder */}
              <div className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0 mt-1">
                <Skeleton className="w-full h-full rounded" />
              </div>
              {/* Address lines */}
              <div className="flex-1 space-y-1">
                <Skeleton className="h-3 w-full bg-gray-300/20" />
                <Skeleton className="h-3 w-4/5 bg-gray-300/20" />
                <Skeleton className="h-3 w-3/5 bg-gray-300/20" />
              </div>
            </div>
          </div>
        </div>

        {/* Grid section skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-12 mb-8 md:mb-12">
          {/* Company links column */}
          <div>
            {/* Heading with underline */}
            <div className="relative inline-block mb-3 md:mb-4 lg:mb-6">
              <Skeleton className="h-6 md:h-7 lg:h-8 w-20 md:w-24 bg-gray-300/20" />
              <div className="absolute -bottom-2 left-0 w-12 h-1">
                <Skeleton className="w-full h-full rounded-full" />
              </div>
            </div>

            {/* Link list */}
            <ul className="space-y-2 md:space-y-3 lg:space-y-4 mt-4 md:mt-6 lg:mt-8">
              {[...Array(4)].map((_, i) => (
                <li key={i} className="flex items-center gap-2">
                  <div className="w-0 group-hover:w-2 h-0.5">
                    <Skeleton className="w-full h-full" />
                  </div>
                  <Skeleton className="h-3 w-16 md:w-20 bg-gray-300/20" />
                </li>
              ))}
            </ul>
          </div>

          {/* Support links column */}
          <div>
            {/* Heading with underline */}
            <div className="relative inline-block mb-3 md:mb-4 lg:mb-6">
              <Skeleton className="h-6 md:h-7 lg:h-8 w-20 md:w-24 bg-gray-300/20" />
              <div className="absolute -bottom-2 left-0 w-12 h-1">
                <Skeleton className="w-full h-full rounded-full" />
              </div>
            </div>

            {/* Link list */}
            <ul className="space-y-2 md:space-y-3 lg:space-y-4 mt-4 md:mt-6 lg:mt-8">
              {[...Array(4)].map((_, i) => (
                <li key={i} className="flex items-center gap-2">
                  <div className="w-0 group-hover:w-2 h-0.5">
                    <Skeleton className="w-full h-full" />
                  </div>
                  <Skeleton className="h-3 w-16 md:w-20 bg-gray-300/20" />
                </li>
              ))}
            </ul>
          </div>

          {/* Contact items column */}
          <div>
            {/* Heading with underline */}
            <div className="relative inline-block mb-3 md:mb-4 lg:mb-6">
              <Skeleton className="h-6 md:h-7 lg:h-8 w-20 md:w-24 bg-gray-300/20" />
              <div className="absolute -bottom-2 left-0 w-12 h-1">
                <Skeleton className="w-full h-full rounded-full" />
              </div>
            </div>

            {/* Contact items list */}
            <ul className="space-y-2.5 md:space-y-3 lg:space-y-4 mt-4 md:mt-6 lg:mt-8">
              {[...Array(3)].map((_, i) => (
                <li key={i} className="flex items-start gap-2">
                  {/* Icon skeleton */}
                  <div className="w-3.5 h-3.5 md:w-5 md:h-5 flex-shrink-0 mt-0.5">
                    <Skeleton className="w-full h-full rounded" />
                  </div>
                  {/* Contact text */}
                  <Skeleton className="h-3 w-24 md:w-32 leading-tight bg-gray-300/20" />
                </li>
              ))}
            </ul>
          </div>

          {/* Social links column */}
          <div>
            {/* Heading with underline */}
            <div className="relative inline-block mb-3 md:mb-4 lg:mb-6">
              <Skeleton className="h-6 md:h-7 lg:h-8 w-24 md:w-28 bg-gray-300/20" />
              <div className="absolute -bottom-2 left-0 w-12 h-1">
                <Skeleton className="w-full h-full rounded-full" />
              </div>
            </div>

            {/* Social icons grid */}
            <div className="flex flex-wrap gap-2 md:gap-3 lg:gap-4 mt-4 md:mt-6 lg:mt-8">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-lg md:rounded-xl bg-white/5 border border-white/10"
                >
                  <Skeleton className="w-full h-full rounded-lg md:rounded-xl" />
                </div>
              ))}
            </div>

            {/* Social description text */}
            <div className="mt-3 md:mt-4 lg:mt-6">
              <Skeleton className="h-3 w-full mb-1 bg-gray-300/20" />
              <Skeleton className="h-3 w-4/5 bg-gray-300/20" />
            </div>
          </div>
        </div>

        {/* Footer bottom skeleton */}
        <div className="border-t border-white/10 pt-6 md:pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
            {/* Copyright text */}
            <div className="flex items-center gap-1">
              <Skeleton className="h-4 w-20 bg-gray-300/20" />
              <Skeleton className="h-4 w-16 bg-gray-300/20" />
              <Skeleton className="h-4 w-24 bg-gray-300/20" />
            </div>

            {/* Legal links */}
            <div className="flex gap-6 md:gap-8">
              {['Terms', 'Privacy', 'Cookies'].map((link, i) => (
                <div key={i} className="relative group">
                  <Skeleton className="h-4 w-12 md:w-16 bg-gray-300/20" />
                  <div className="absolute -bottom-1 left-0 w-0 group-hover:w-full h-0.5">
                    <Skeleton className="w-full h-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}