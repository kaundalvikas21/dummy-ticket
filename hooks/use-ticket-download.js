"use client"

import { useState, useRef } from "react"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

export function useTicketDownload() {
    const [isDownloading, setIsDownloading] = useState(false)
    const templateRef = useRef(null)

    const download = async (booking) => {
        if (!booking || !templateRef.current) {
            console.error("Download failed: booking data or template ref missing", { booking, hasRef: !!templateRef.current })
            return
        }

        setIsDownloading(true)
        try {
            const element = templateRef.current
            const canvas = await html2canvas(element, {
                scale: 3, // High resolution
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
            const imgProps = pdf.getImageProperties(imgData)
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width

            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight)
            pdf.save(`Booking_Recipient_${booking.id}.pdf`)

            return true
        } catch (error) {
            console.error("PDF Generation error:", error)
            return false
        } finally {
            setIsDownloading(false)
        }
    }

    return {
        download,
        isDownloading,
        templateRef
    }
}
