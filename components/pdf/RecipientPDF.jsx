"use client"

import React from "react"
import { format } from "date-fns"

const PDF_STYLES = {
    container: { width: '800px', padding: '40px', backgroundColor: '#ffffff', color: '#1e293b', fontFamily: 'sans-serif' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px' },
    title: { fontSize: '32px', fontWeight: '800', color: '#1e40af', margin: '0' },
    subtitle: { color: '#64748b', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', margin: '6px 0 0 0', letterSpacing: '1px' },
    grid2: { display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', marginBottom: '20px' },
    card: { border: '1px solid #f1f5f9', borderRadius: '10px', padding: '20px', backgroundColor: '#ffffff' },
    sectionLabel: { fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700', marginBottom: '15px', letterSpacing: '0.5px' },
    fieldGroup: { marginBottom: '12px' },
    fieldLabel: { fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase', margin: '0' },
    fieldValue: { fontSize: '13px', fontWeight: '700', color: '#1e293b', margin: '4px 0 0 0' },
    itineraryHeader: { backgroundColor: '#f8fafc', padding: '10px 20px', borderBottom: '1px solid #f1f5f9' },
    itineraryBody: { padding: '24px 20px' },
    importantNotes: { backgroundColor: '#f8fafc', padding: '20px', borderRadius: '10px', border: '1px solid #f1f5f9' }
}

const formatLocation = (loc) => {
    if (!loc) return loc;
    return loc.replace(/ - ([a-zA-Z]+)$/, (match, code) => ` - ${code.toUpperCase()}`);
};

export const RecipientPDF = React.forwardRef(({ booking }, ref) => {
    if (!booking) return null;

    // Support both raw DB structure and formatted structure
    const p = booking.passenger_details || {};
    const createdAt = booking.created_at || booking.rawDate || new Date();

    return (
        <div className="fixed left-[-9999px] top-0" aria-hidden="true">
            <div ref={ref} style={PDF_STYLES.container}>
                {/* Header */}
                <div style={PDF_STYLES.header}>
                    <div>
                        <h1 style={PDF_STYLES.title}>VisaFly</h1>
                        <p style={PDF_STYLES.subtitle}>Booking Recipient</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: '0', fontSize: '12px', color: '#64748b' }}>Date: {format(new Date(createdAt), "PPP")}</p>
                        <p style={{ margin: '6px 0 0 0', fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>Ref: {booking.id}</p>
                    </div>
                </div>

                {/* Booking & Transaction Details */}
                <div style={PDF_STYLES.grid2}>
                    <div style={PDF_STYLES.card}>
                        <h3 style={PDF_STYLES.sectionLabel}>Passenger & Booking Info</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div style={PDF_STYLES.fieldGroup}>
                                <p style={PDF_STYLES.fieldLabel}>Lead Passenger</p>
                                <p style={PDF_STYLES.fieldValue}>{booking.passenger || `${p?.firstName || ''} ${p?.lastName || ''}`.trim() || 'N/A'}</p>
                            </div>
                            <div style={PDF_STYLES.fieldGroup}>
                                <p style={PDF_STYLES.fieldLabel}>Passenger Email</p>
                                <p style={{ ...PDF_STYLES.fieldValue, fontSize: '12px' }}>{booking.email || p?.deliveryEmail || p?.email || 'N/A'}</p>
                            </div>
                            <div style={PDF_STYLES.fieldGroup}>
                                <p style={PDF_STYLES.fieldLabel}>Booking ID</p>
                                <p style={{ ...PDF_STYLES.fieldValue, fontSize: '12px', color: '#475569' }}>{booking.id}</p>
                            </div>
                            <div style={PDF_STYLES.fieldGroup}>
                                <p style={PDF_STYLES.fieldLabel}>Service Type</p>
                                <p style={{ ...PDF_STYLES.fieldValue, color: '#2563eb' }}>
                                    {booking.service_plan_name || booking.type || 'Standard Ticket'}
                                </p>
                            </div>
                            <div style={PDF_STYLES.fieldGroup}>
                                <p style={PDF_STYLES.fieldLabel}>Nationality</p>
                                <p style={PDF_STYLES.fieldValue}>{p?.nationality || "N/A"}</p>
                            </div>
                            <div style={PDF_STYLES.fieldGroup}>
                                <p style={PDF_STYLES.fieldLabel}>Passport</p>
                                <p style={PDF_STYLES.fieldValue}>{p?.passportNumber || "N/A"}</p>
                            </div>
                        </div>
                    </div>

                    <div style={PDF_STYLES.card}>
                        <h3 style={PDF_STYLES.sectionLabel}>Payment Details</h3>
                        <div style={PDF_STYLES.fieldGroup}>
                            <p style={PDF_STYLES.fieldLabel}>Transaction ID</p>
                            <p style={{ fontSize: '11px', fontWeight: '600', fontFamily: 'monospace', color: '#475569', margin: '4px 0 0 0' }}>{booking.payment_intent_id || booking.transactionId || 'N/A'}</p>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '10px' }}>
                            <div>
                                <p style={PDF_STYLES.fieldLabel}>Status</p>
                                <p style={{ fontSize: '13px', fontWeight: '700', color: '#059669', margin: '4px 0 0 0' }}>PAID</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={PDF_STYLES.fieldLabel}>Amount Paid</p>
                                <p style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', margin: '4px 0 0 0' }}>{booking.currency} {booking.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Itinerary Details */}
                <div style={{ border: '1px solid #f1f5f9', borderRadius: '10px', marginBottom: '24px', overflow: 'hidden' }}>
                    <div style={PDF_STYLES.itineraryHeader}>
                        <h3 style={{ ...PDF_STYLES.sectionLabel, color: '#475569', marginBottom: 0 }}>Itinerary Details</h3>
                    </div>
                    <div style={PDF_STYLES.itineraryBody}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ flex: '1' }}>
                                <p style={PDF_STYLES.fieldLabel}>From</p>
                                <p style={{ fontSize: '18px', fontWeight: '800', margin: '2px 0 0 0' }}>{formatLocation(p?.departureCity || booking.departure)}</p>
                                <p style={{ fontSize: '12px', fontWeight: '700', color: '#2563eb', margin: '6px 0 0 0' }}>{p?.departureDate || booking.date}</p>
                            </div>
                            <div style={{ flex: '0 0 120px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ width: '60px', height: '1px', backgroundColor: '#cbd5e1', marginBottom: '8px' }}></div>
                                <span style={{ fontSize: '8px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>{p?.tripType || 'One-Way'}</span>
                            </div>
                            <div style={{ flex: '1', textAlign: 'right' }}>
                                <p style={PDF_STYLES.fieldLabel}>To</p>
                                <p style={{ fontSize: '18px', fontWeight: '800', margin: '2px 0 0 0' }}>{formatLocation(p?.arrivalCity || booking.arrival)}</p>
                                {p?.returnDate || booking.returnDate ? (
                                    <p style={{ fontSize: '12px', fontWeight: '700', color: '#059669', margin: '6px 0 0 0' }}>Return: {p?.returnDate || booking.returnDate}</p>
                                ) : null}
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
});

RecipientPDF.displayName = "RecipientPDF"
