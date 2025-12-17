"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { User, LogIn, UserPlus } from "lucide-react"

export function AuthGuardWrapper({ children, className }) {
    const { isAuthenticated } = useAuth()
    const [showAuthDialog, setShowAuthDialog] = useState(false)
    const router = useRouter()

    const handleClick = (e) => {
        if (!isAuthenticated) {
            e.preventDefault()
            e.stopPropagation()
            setShowAuthDialog(true)
        }
    }

    return (
        <>
            <div onClick={handleClick} className={className}>
                {children}
            </div>

            <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-center text-2xl font-bold bg-gradient-to-r from-[#0066FF] to-[#00D4AA] bg-clip-text text-transparent">
                            Access Restricted
                        </DialogTitle>
                        <DialogDescription className="text-center text-gray-500 text-base mt-2">
                            Please login or create an account to continue with your ticket purchase.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <Link href="/login" onClick={() => setShowAuthDialog(false)} className="w-full">
                            <Button className="w-full h-12 text-base bg-gradient-to-r from-[#0066FF] to-[#00D4AA] text-white hover:shadow-lg hover:shadow-[#0066FF]/30 transition-all">
                                <LogIn className="w-5 h-5 mr-2" />
                                Login
                            </Button>
                        </Link>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-gray-500">Or</span>
                            </div>
                        </div>

                        <Link href="/register" onClick={() => setShowAuthDialog(false)} className="w-full">
                            <Button variant="outline" className="w-full h-12 text-base border-2 hover:bg-gray-50 transition-all">
                                <UserPlus className="w-5 h-5 mr-2" />
                                Create Account
                            </Button>
                        </Link>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
