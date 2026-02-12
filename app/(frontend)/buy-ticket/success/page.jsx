"use client"

import { useEffect, useState, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Check, ArrowRight, Download, Home, Calendar, User, Hash, ReceiptText, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { format } from "date-fns"

import { RecipientPDF } from "@/components/pdf/RecipientPDF"
import { useTicketDownload } from "@/hooks/use-ticket-download"

export default function SuccessPage() {
    const searchParams = useSearchParams()
    const sessionId = searchParams.get("session_id")
    const router = useRouter()

    const [status, setStatus] = useState('processing')
    const [booking, setBooking] = useState(null)
    const { download, isDownloading, templateRef } = useTicketDownload()

    useEffect(() => {
        if (!sessionId) {
            router.push("/")
            return
        }

        // Clear form data immediately upon landing on success page
        sessionStorage.removeItem('buyTicketFormData')

        const verifyPayment = async () => {
            try {
                const response = await fetch("/api/verify-payment", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ session_id: sessionId }),
                })

                if (response.ok) {
                    const data = await response.json()
                    setBooking(data.booking)
                    setStatus('success')
                } else {
                    const errorData = await response.json()
                    console.error("Payment verification failed:", errorData)
                    setStatus('error')
                }
            } catch (error) {
                console.error("Verification error:", error)
                setStatus('error')
            }
        }

        verifyPayment()
    }, [sessionId, router])

    const handleDownloadPDF = async () => {
        await download(booking)
    }

    if (status === 'processing' || (status === 'success' && !booking)) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-500 font-medium">Finalizing your booking details...</p>
            </div>
        )
    }

    if (status === 'error') {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
                <h1 className="text-2xl font-bold text-red-600 mb-4">Verification Failed</h1>
                <p className="text-gray-600 mb-8">We couldn't verify your payment. Please contact support.</p>
                <Button onClick={() => router.push("/")} className="rounded-xl">Return Home</Button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 pt-32 pb-12">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-4xl p-8 md:p-10 max-w-xl w-full text-center shadow-2xl border border-gray-100 relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-blue-500 via-emerald-500 to-blue-500"></div>

                <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3 shadow-lg shadow-emerald-50">
                    <div className="w-16 h-16 bg-emerald-500 rounded-xl flex items-center justify-center -rotate-3">
                        <Check className="w-10 h-10 text-white" />
                    </div>
                </div>

                <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Payment Successful!</h1>
                <p className="text-gray-500 mb-8 max-w-sm mx-auto text-sm">Your booking is confirmed. We've sent the details to your email.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <InfoCard icon={<Hash className="w-4 h-4" />} label="Booking ID" value={booking?.id} />
                    <InfoCard icon={<ReceiptText className="w-4 h-4" />} label="Transaction ID" value={booking?.payment_intent_id} mono />
                    <InfoCard icon={<Calendar className="w-4 h-4" />} label="Booking Date" value={booking?.created_at && format(new Date(booking.created_at), "MMM d, yyyy HH:mm")} />
                    <InfoCard icon={<User className="w-4 h-4" />} label="User ID" value={booking?.user_id || "Guest User"} mono />
                </div>

                <div className="bg-emerald-50 rounded-2xl p-4 mb-8 flex items-center justify-between border border-emerald-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm"><ShieldCheck className="w-5 h-5 text-emerald-600" /></div>
                        <div className="text-left">
                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest leading-none mb-1">Status</p>
                            <p className="text-sm font-bold text-emerald-900">Confirmed & Paid</p>
                        </div>
                    </div>
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                </div>

                <div className="flex flex-col gap-3">
                    <Button
                        onClick={handleDownloadPDF}
                        disabled={isDownloading || !booking}
                        className="w-full h-14 rounded-2xl font-bold bg-[#0066FF] hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5 cursor-pointer"
                    >
                        {isDownloading ? (
                            <div className="flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                Generating...
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2">
                                <Download className="w-5 h-5" /> Download Recipient
                            </div>
                        )}
                    </Button>

                    <div className="grid grid-cols-2 gap-3">
                        <NavButton href="/user" icon={<ArrowRight className="w-4 h-4 mr-2" />} label="My Account" />
                        <NavButton href="/" icon={<Home className="w-4 h-4 mr-2" />} label="Home" />
                    </div>
                </div>
            </motion.div>

            <RecipientPDF booking={booking} ref={templateRef} />
        </div>
    )
}

function InfoCard({ icon, label, value, mono }) {
    return (
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex flex-col gap-1 text-left min-w-0">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
                {icon}
                <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
            </div>
            <span
                className={`text-sm font-bold text-gray-800 truncate ${mono ? 'font-mono text-blue-600' : ''}`}
                title={value}
            >
                {value || "N/A"}
            </span>
        </div>
    )
}

function NavButton({ href, icon, label }) {
    return (
        <Button variant="outline" asChild className="h-12 rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold cursor-pointer">
            <Link href={href}>{icon} {label}</Link>
        </Button>
    )
}
