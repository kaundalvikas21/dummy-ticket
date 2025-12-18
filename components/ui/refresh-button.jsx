"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

export function RefreshButton({ className, onRefreshStart, onRefreshEnd }) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const handleRefresh = async () => {
        if (isLoading) return

        setIsLoading(true)
        if (onRefreshStart) onRefreshStart()

        // Trigger router refresh
        router.refresh()

        // Artificial delay to show the animation and ensure data has time to propagate if needed
        // or just to give feedback. In Next.js router.refresh() is async but doesn't return a promise
        // that resolves when the data is fully re-fetched.
        // So we assume a minimum loading time for UX.
        setTimeout(() => {
            setIsLoading(false)
            if (onRefreshEnd) onRefreshEnd()
        }, 1000)
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className={cn("gap-2", className)}
        >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            {isLoading ? "Refreshing..." : "Refresh"}
        </Button>
    )
}
