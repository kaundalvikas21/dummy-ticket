"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false)

    // Show button when page is scrolled up to given distance
    const toggleVisibility = () => {
        if (window.scrollY > 300) {
            setIsVisible(true)
        } else {
            setIsVisible(false)
        }
    }

    // Set the top scroll behavior
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        })
    }

    useEffect(() => {
        window.addEventListener("scroll", toggleVisibility)
        return () => window.removeEventListener("scroll", toggleVisibility)
    }, [])

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 20 }}
                    className="fixed bottom-8 right-8 z-[60]"
                >
                    <Button
                        onClick={scrollToTop}
                        size="icon"
                        className={cn(
                            "w-12 h-12 rounded-full shadow-lg transition-all duration-300",
                            "bg-gradient-to-br from-[#0066FF] to-[#00D4AA] hover:from-[#0055DD] hover:to-[#00C399]",
                            "border-none text-white hover:scale-110 active:scale-95",
                            "hover:shadow-[#0066FF]/30 hover:shadow-xl"
                        )}
                        aria-label="Scroll to top"
                    >
                        <ChevronUp className="w-6 h-6" />
                    </Button>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
