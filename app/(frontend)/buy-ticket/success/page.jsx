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

const PDF_STYLES = {
    container: { width: '800px', padding: '32px', backgroundColor: '#ffffff', color: '#1f2937', fontFamily: 'sans-serif' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #e5e7eb', paddingBottom: '16px' },
    title: { fontSize: '28px', fontWeight: '800', color: '#1e40af', margin: '0' },
    subtitle: { color: '#6b7280', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', margin: '4px 0 0 0' },
    grid2: { display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', marginBottom: '24px' },
    card: { border: '1px solid #f3f4f6', borderRadius: '8px', padding: '16px' },
    sectionLabel: { fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: '700', marginBottom: '12px' },
    fieldLabel: { fontSize: '9px', color: '#9ca3af', margin: '0' },
    fieldValue: { fontSize: '14px', fontWeight: '700', margin: '2px 0 0 0' },
    itineraryHeader: { backgroundColor: '#f9fafb', padding: '8px 16px', borderBottom: '1px solid #f3f4f6' },
    itineraryBody: { padding: '20px 16px' },
    importantNotes: { backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px', border: '1px solid #f3f4f6' }
}

const RecipientTemplate = ({ booking, acknowledgmentRef }) => {
    if (!booking) return null;

    return (
        <div className="fixed left-[-9999px] top-0">
            <div ref={acknowledgmentRef} style={PDF_STYLES.container}>
                {/* Header */}
                <div style={PDF_STYLES.header}>
                    <div>
                        <h1 style={PDF_STYLES.title}>VisaFly</h1>
                        <p style={PDF_STYLES.subtitle}>Booking Recipient</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: '0', fontSize: '12px', color: '#9ca3af' }}>Date: {format(new Date(booking.created_at), "PPP")}</p>
                        <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#9ca3af', fontFamily: 'monospace' }}>Ref: {booking.id}</p>
                    </div>
                </div>

                {/* Booking & Transaction Details */}
                <div style={PDF_STYLES.grid2}>
                    <div style={PDF_STYLES.card}>
                        <h3 style={PDF_STYLES.sectionLabel}>Passenger & Booking Info</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div>
                                <p style={PDF_STYLES.fieldLabel}>Lead Passenger</p>
                                <p style={PDF_STYLES.fieldValue}>{booking.passenger_details?.firstName} {booking.passenger_details?.lastName}</p>
                            </div>
                            <div>
                                <p style={PDF_STYLES.fieldLabel}>Booking ID</p>
                                <p style={PDF_STYLES.fieldValue}>{booking.id}</p>
                            </div>
                            <div>
                                <p style={PDF_STYLES.fieldLabel}>User ID</p>
                                <p style={{ ...PDF_STYLES.fieldValue, fontSize: '12px' }}>{booking.user_id || "Guest User"}</p>
                            </div>
                            <div>
                                <p style={PDF_STYLES.fieldLabel}>Nationality</p>
                                <p style={{ ...PDF_STYLES.fieldValue, fontSize: '13px' }}>{booking.passenger_details?.nationality || "N/A"}</p>
                            </div>
                            <div>
                                <p style={PDF_STYLES.fieldLabel}>Passport</p>
                                <p style={{ ...PDF_STYLES.fieldValue, fontSize: '13px' }}>{booking.passenger_details?.passportNumber || "N/A"}</p>
                            </div>
                        </div>
                    </div>

                    <div style={PDF_STYLES.card}>
                        <h3 style={PDF_STYLES.sectionLabel}>Payment Details</h3>
                        <div style={{ marginBottom: '12px' }}>
                            <p style={PDF_STYLES.fieldLabel}>Transaction ID</p>
                            <p style={{ fontSize: '12px', fontWeight: '600', fontFamily: 'monospace', margin: '2px 0 0 0' }}>{booking.payment_intent_id}</p>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <p style={PDF_STYLES.fieldLabel}>Status</p>
                                <p style={{ fontSize: '12px', fontWeight: '700', color: '#059669', margin: '2px 0 0 0' }}>PAID</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={PDF_STYLES.fieldLabel}>Amount Paid</p>
                                <p style={{ fontSize: '18px', fontWeight: '800', color: '#111827', margin: '2px 0 0 0' }}>{booking.currency} {booking.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Itinerary Details */}
                <div style={{ border: '1px solid #f3f4f6', borderRadius: '8px', marginBottom: '24px' }}>
                    <div style={PDF_STYLES.itineraryHeader}>
                        <h3 style={{ ...PDF_STYLES.sectionLabel, color: '#6b7280', marginBottom: 0 }}>Itinerary Details</h3>
                    </div>
                    <div style={PDF_STYLES.itineraryBody}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ flex: '1' }}>
                                <p style={PDF_STYLES.fieldLabel}>From</p>
                                <p style={{ fontSize: '18px', fontWeight: '800', margin: '2px 0 0 0' }}>{booking.passenger_details?.departureCity}</p>
                                <p style={{ fontSize: '12px', fontWeight: '600', color: '#2563eb', margin: '4px 0 0 0' }}>{booking.passenger_details?.departureDate}</p>
                            </div>
                            <div style={{ flex: '0 0 100px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ width: '60px', height: '1px', backgroundColor: '#d1d5db', marginBottom: '8px' }}></div>
                                <span style={{ fontSize: '8px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: '700' }}>{booking.passenger_details?.tripType}</span>
                            </div>
                            <div style={{ flex: '1', textAlign: 'right' }}>
                                <p style={PDF_STYLES.fieldLabel}>To</p>
                                <p style={{ fontSize: '18px', fontWeight: '800', margin: '2px 0 0 0' }}>{booking.passenger_details?.arrivalCity}</p>
                                {booking.passenger_details?.returnDate && (
                                    <p style={{ fontSize: '12px', fontWeight: '600', color: '#059669', margin: '4px 0 0 0' }}>Return: {booking.passenger_details?.returnDate}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Info */}
                <div style={PDF_STYLES.importantNotes}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ maxWidth: '450px' }}>
                            <h4 style={{ fontSize: '10px', fontWeight: '700', color: '#374151', textTransform: 'uppercase', marginBottom: '8px' }}>Important Notes</h4>
                            <p style={{ fontSize: '9px', color: '#6b7280', margin: '0', lineHeight: '1.5' }}>
                                • This document serves as a booking confirmation for your dummy ticket. <br />
                                • Valid for 14 days from the date of issue for visa and travel documentation. <br />
                                • For further assistance or manual verification, visit www.visafly.com.
                            </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: '10px', fontWeight: '700', color: '#1e40af', margin: '0' }}>VisaFly Support</p>
                            <p style={{ fontSize: '9px', color: '#6b7280', margin: '4px 0 0 0' }}>help@visafly.com</p>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '24px', textAlign: 'center', opacity: '0.4' }}>
                    <p style={{ fontSize: '8px', margin: '0' }}>This is an automated acknowledgment. No physical signature is required.</p>
                </div>
            </div>
        </div>
    );
};

export default function SuccessPage() {
    const searchParams = useSearchParams()
    const sessionId = searchParams.get("session_id")
    const router = useRouter()

    const [status, setStatus] = useState('processing')
    const [booking, setBooking] = useState(null)
    const [isDownloading, setIsDownloading] = useState(false)
    const acknowledgmentRef = useRef(null)

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
        if (!booking || !acknowledgmentRef.current) return

        setIsDownloading(true)
        try {
            const element = acknowledgmentRef.current
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: "#ffffff",
                onclone: (clonedDoc) => {
                    const styles = clonedDoc.getElementsByTagName('style');
                    const links = clonedDoc.getElementsByTagName('link');
                    for (let i = styles.length - 1; i >= 0; i--) styles[i].parentNode.removeChild(styles[i]);
                    for (let i = links.length - 1; i >= 0; i--) {
                        if (links[i].rel === 'stylesheet') links[i].parentNode.removeChild(links[i]);
                    }
                }
            })

            const imgData = canvas.toDataURL("image/png")
            const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
            const pdfWidth = pdf.internal.pageSize.getWidth()
            const pdfHeight = (pdf.getImageProperties(imgData).height * pdfWidth) / pdf.getImageProperties(imgData).width

            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight)
            pdf.save(`Booking_Recipient_${booking.id}.pdf`)
        } catch (error) {
            console.error("PDF Generation error:", error)
        } finally {
            setIsDownloading(false)
        }
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
                className="bg-white rounded-[2rem] p-8 md:p-10 max-w-xl w-full text-center shadow-2xl border border-gray-100 relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-emerald-500 to-blue-500"></div>

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
                        <NavButton href="/user" icon={<ArrowRight className="w-4 h-4 mr-2" />} label="Dashboard" />
                        <NavButton href="/" icon={<Home className="w-4 h-4 mr-2" />} label="Home" />
                    </div>
                </div>
            </motion.div>

            <RecipientTemplate booking={booking} acknowledgmentRef={acknowledgmentRef} />
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
