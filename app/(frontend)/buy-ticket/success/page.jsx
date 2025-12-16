"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Check, ArrowRight, Download, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function SuccessPage() {
    const searchParams = useSearchParams()
    const sessionId = searchParams.get("session_id")
    const router = useRouter()

    if (!sessionId) {
        // If accessed directly without session, redirect to home
        // useEffect(() => router.push("/"), [router]) 
        // return null
        // Or show a generic message
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl p-8 md:p-12 max-w-lg w-full text-center shadow-xl border border-gray-100"
            >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="w-10 h-10 text-green-600" />
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
                <p className="text-gray-600 mb-8 leading-relaxed">
                    Thank you for your purchase. We have received your order and sent a confirmation email to you.
                </p>

                <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left border border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-500">Transaction ID</span>
                        <span className="text-sm font-mono text-gray-700 font-medium truncate max-w-[150px]">{sessionId ? sessionId.slice(0, 10) + "..." : "N/A"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Status</span>
                        <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Completed</span>
                    </div>
                </div>

                <div className="space-y-3">
                    <Button onClick={() => router.push("/dashboard")} className="w-full h-12 rounded-xl font-semibold bg-[#0066FF] hover:bg-blue-700">
                        Go to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>

                    <Button variant="outline" asChild className="w-full h-12 rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50">
                        <Link href="/">
                            <Home className="w-4 h-4 mr-2" /> Return Home
                        </Link>
                    </Button>
                </div>
            </motion.div>
        </div>
    )
}
