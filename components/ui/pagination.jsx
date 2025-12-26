"use client"

import React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    className = "",
}) {
    if (totalPages <= 1) return null

    const pages = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) {
            pages.push(i)
        }
    } else {
        // Logic for ellipses if totalPages > 5
        if (currentPage <= 3) {
            pages.push(1, 2, 3, 4, "...", totalPages)
        } else if (currentPage >= totalPages - 2) {
            pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
        } else {
            pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages)
        }
    }

    return (
        <div className={`flex items-center justify-end gap-2 py-4 ${className}`}>
            <div className="flex items-center gap-1.5 bg-gray-50/50 p-1 rounded-lg border border-gray-100">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-8 w-8 hover:bg-white hover:shadow-sm transition-all duration-200"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-1">
                    {pages.map((page, index) => (
                        <React.Fragment key={index}>
                            {page === "..." ? (
                                <span className="px-1 text-gray-400">
                                    <MoreHorizontal className="h-3 w-3" />
                                </span>
                            ) : (
                                <Button
                                    variant={currentPage === page ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => onPageChange(page)}
                                    className={`h-8 w-8 text-xs font-semibold overflow-hidden transition-all duration-300 ${currentPage === page
                                            ? "bg-linear-to-br from-[#0066FF] to-[#00D4AA] text-white shadow-md shadow-blue-500/20 scale-105"
                                            : "hover:bg-white hover:shadow-sm"
                                        }`}
                                >
                                    {page}
                                </Button>
                            )}
                        </React.Fragment>
                    ))}
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 hover:bg-white hover:shadow-sm transition-all duration-200"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            <div className="text-xs text-gray-500 ml-4 font-medium hidden sm:block">
                Page {currentPage} of {totalPages}
            </div>
        </div>
    )
}
