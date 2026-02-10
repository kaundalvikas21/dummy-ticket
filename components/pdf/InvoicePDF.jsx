import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register a nice font if possible, otherwise use Helvetica
Font.register({
    family: 'Inter',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.ttf' },
        { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hjp-Ek-_EeA.ttf', fontWeight: 'bold' }
    ]
});

const styles = StyleSheet.create({
    page: {
        padding: 40,
        backgroundColor: '#ffffff',
        fontFamily: 'Helvetica', // Fallback to Helvetica for reliability
        color: '#334155'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 40,
        borderBottom: '2px solid #f1f5f9',
        paddingBottom: 20
    },
    logoSection: {
        flexDirection: 'column'
    },
    logoText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e40af', // Blue-800
        marginBottom: 4
    },
    invoiceLabel: {
        fontSize: 10,
        color: '#64748b',
        letterSpacing: 2,
        textTransform: 'uppercase',
        fontWeight: 'bold'
    },
    invoiceDetails: {
        alignItems: 'flex-end',
        textAlign: 'right'
    },
    invoiceTitle: {
        fontSize: 32,
        color: '#0f172a', // Slate-900
        fontWeight: 'heavy',
        marginBottom: 10
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: 4
    },
    detailLabel: {
        fontSize: 9,
        color: '#94a3b8',
        marginRight: 8,
        textAlign: 'right',
        width: 60
    },
    detailValue: {
        fontSize: 9,
        color: '#334155',
        fontWeight: 'bold',
        textAlign: 'right'
    },
    billTo: {
        marginBottom: 30,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    billToSection: {
        width: '45%'
    },
    sectionTitle: {
        fontSize: 10,
        color: '#94a3b8',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 8,
        letterSpacing: 1
    },
    billToName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 4
    },
    billToText: {
        fontSize: 10,
        color: '#64748b',
        lineHeight: 1.4
    },
    statusBadge: {
        padding: '4px 12px',
        backgroundColor: '#dcfce7',
        borderRadius: 12,
        alignSelf: 'flex-start'
    },
    statusText: {
        color: '#166534',
        fontSize: 9,
        fontWeight: 'bold',
        textTransform: 'uppercase'
    },
    table: {
        marginTop: 20,
        marginBottom: 30,
        borderRadius: 8,
        overflow: 'hidden',
        border: '1px solid #e2e8f0'
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f8fafc',
        padding: '12px 16px',
        borderBottom: '1px solid #e2e8f0'
    },
    tableRow: {
        flexDirection: 'row',
        padding: '16px',
        borderBottom: '1px solid #f1f5f9'
    },
    colDesc: { flex: 4 },
    colQty: { flex: 0.8, textAlign: 'center' },
    colPrice: { flex: 1.2, textAlign: 'right' },
    colTotal: { flex: 1.2, textAlign: 'right' },

    th: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#64748b',
        textTransform: 'uppercase'
    },
    td: {
        fontSize: 10,
        color: '#334155'
    },
    tdDesc: {
        fontSize: 10,
        color: '#0f172a',
        fontWeight: 'bold'
    },
    tdSub: {
        fontSize: 9,
        color: '#64748b',
        marginTop: 2
    },
    totalSection: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 40
    },
    totalRow: {
        flexDirection: 'row',
        marginBottom: 8,
        justifyContent: 'flex-end',
        width: 200
    },
    totalLabel: {
        fontSize: 10,
        color: '#64748b',
        marginRight: 16
    },
    totalValue: {
        fontSize: 10,
        color: '#0f172a',
        fontWeight: 'bold',
        width: 80,
        textAlign: 'right'
    },
    grandTotal: {
        fontSize: 14,
        color: '#1e40af',
        fontWeight: 'bold',
        width: 80,
        textAlign: 'right'
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        left: 40,
        right: 40,
        borderTop: '1px solid #e2e8f0',
        paddingTop: 20,
        textAlign: 'center'
    },
    footerText: {
        fontSize: 8,
        color: '#94a3b8',
        marginBottom: 4
    },
    itinerarySummary: {
        backgroundColor: '#f8fafc',
        padding: 16,
        borderRadius: 8,
        border: '1px solid #e2e8f0',
        marginBottom: 20
    },
    itineraryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
    },
    portCode: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0f172a'
    },
    portName: {
        fontSize: 9,
        color: '#64748b'
    },
    flightLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#cbd5e1',
        marginHorizontal: 16,
        position: 'relative'
    }
});

const formatCurrency = (amount, currency = 'USD') => {
    try {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            currencyDisplay: 'code'
        }).format(amount);
    } catch (e) {
        // Fallback if currency code is invalid
        return `${currency.toUpperCase()} ${amount.toFixed(2)}`;
    }
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
};

const InvoicePDF = ({ payment }) => {
    // Safe formatting helpers
    const getPassengerName = () => {
        // Check both flat structure and nested details
        if (payment.passenger) return payment.passenger;
        const details = payment.passenger_details || {};
        return `${details.firstName || ''} ${details.lastName || ''}`.trim() || 'Guest';
    };

    const getEmail = () => {
        return payment.email || payment.passenger_details?.email || 'N/A';
    };

    const getRoute = () => {
        // payment.route is usually formatted "City - Code -> City - Code"
        // we can try to parse it or just display it.
        if (payment.route) return payment.route;
        const d = payment.passenger_details || {};
        return `${d.departureCity || 'N/A'} -> ${d.arrivalCity || 'N/A'}`;
    }

    const passengerName = getPassengerName();
    const email = getEmail();
    const route = getRoute();

    // Parse numeric amount
    const amount = parseFloat(payment.amount || 0);

    return (
        <Document>
            <Page size="A4" style={styles.page}>

                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.logoSection}>
                        <Text style={styles.logoText}>{process.env.APP_NAME || 'Dummy Ticket'}</Text>
                        <Text style={styles.invoiceLabel}>Official Receipt</Text>
                    </View>
                    <View style={styles.invoiceDetails}>
                        <Text style={styles.invoiceTitle}>INVOICE</Text>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Date:</Text>
                            <Text style={styles.detailValue}>{payment.bookingDate || formatDate(new Date())}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Ref ID:</Text>
                            <Text style={styles.detailValue}>{payment.bookingId}</Text>
                        </View>
                        <View style={{ marginTop: 8 }}>
                            <View style={styles.statusBadge}>
                                <Text style={styles.statusText}>{payment.status || 'PAID'}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Bill To */}
                <View style={styles.billTo}>
                    <View style={styles.billToSection}>
                        <Text style={styles.sectionTitle}>Billed To</Text>
                        <Text style={styles.billToName}>{passengerName}</Text>
                        <Text style={styles.billToText}>{email}</Text>
                        <Text style={styles.billToText}>{payment.phone || 'N/A'}</Text>
                    </View>
                    <View style={[styles.billToSection, { alignItems: 'flex-end' }]}>
                        <Text style={[styles.sectionTitle, { textAlign: 'right' }]}>Payment Method</Text>
                        <Text style={[styles.billToName, { fontSize: 12 }]}>{payment.method || 'Credit Card'}</Text>
                        <Text style={styles.billToText}>{payment.transactionId || payment.payment_intent_id}</Text>
                    </View>
                </View>

                {/* Itinerary Summary */}
                <View style={styles.itinerarySummary}>
                    <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>Travel Itinerary</Text>
                    <View style={styles.itineraryRow}>
                        <View style={{ width: '40%' }}>
                            <Text style={styles.portCode}>{payment.departure ? payment.departure.split('-')[1]?.trim() : 'DEP'}</Text>
                            <Text style={styles.portName}>{payment.departure || 'Departure City'}</Text>
                            <Text style={[styles.portName, { marginTop: 4, color: '#1e40af' }]}>{formatDate(payment.date)}</Text>
                        </View>
                        <View style={{ width: '20%', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', marginTop: 3 }}>
                            <Text style={{ fontSize: 10, color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase', textAlign: 'center' }}>
                                TO
                            </Text>
                        </View>
                        <View style={{ width: '40%', alignItems: 'flex-end' }}>
                            <Text style={styles.portCode}>{payment.arrival ? payment.arrival.split('-')[1]?.trim() : 'ARR'}</Text>
                            <Text style={[styles.portName, { textAlign: 'right' }]}>{payment.arrival || 'Arrival City'}</Text>
                            {payment.returnDate && (
                                <Text style={[styles.portName, { marginTop: 4, color: '#1e40af', textAlign: 'right' }]}>Ret: {formatDate(payment.returnDate)}</Text>
                            )}
                        </View>
                    </View>
                </View>

                {/* Line Items Table */}
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <View style={styles.colDesc}><Text style={styles.th}>Description</Text></View>
                        <View style={styles.colQty}><Text style={styles.th}>Qty</Text></View>
                        <View style={styles.colPrice}><Text style={styles.th}>Price</Text></View>
                        <View style={styles.colTotal}><Text style={styles.th}>Total</Text></View>
                    </View>
                    <View style={styles.tableRow}>
                        <View style={styles.colDesc}>
                            <Text style={styles.tdDesc}>{payment.type || 'Travel Service'}</Text>
                            <View style={{ marginTop: 4 }}>
                                <Text style={[styles.tdSub, { fontSize: 8, color: '#64748b' }]}>FROM</Text>
                                <Text style={[styles.td, { fontSize: 9, marginBottom: 2 }]}>{payment.departure}</Text>

                                <Text style={[styles.tdSub, { fontSize: 8, color: '#64748b', marginTop: 2 }]}>TO</Text>
                                <Text style={[styles.td, { fontSize: 9 }]}>{payment.arrival}</Text>
                            </View>
                            <Text style={[styles.tdSub, { marginTop: 6, fontStyle: 'italic' }]}>
                                Booking Ref: {payment.bookingId}
                            </Text>
                        </View>
                        <View style={styles.colQty}><Text style={[styles.td, { marginTop: 4 }]}>1</Text></View>
                        <View style={styles.colPrice}><Text style={[styles.td, { marginTop: 4 }]}>{formatCurrency(amount, payment.currency)}</Text></View>
                        <View style={styles.colTotal}><Text style={[styles.td, { marginTop: 4, fontWeight: 'bold' }]}>{formatCurrency(amount, payment.currency)}</Text></View>
                    </View>
                </View>

                {/* Totals */}
                <View style={styles.totalSection}>
                    <View>
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Subtotal</Text>
                            <Text style={styles.totalValue}>{formatCurrency(amount, payment.currency)}</Text>
                        </View>
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Tax (0%)</Text>
                            <Text style={styles.totalValue}>{formatCurrency(0, payment.currency)}</Text>
                        </View>
                        <View style={[styles.totalRow, { marginTop: 8, borderTop: '1px solid #e2e8f0', paddingTop: 8 }]}>
                            <Text style={[styles.totalLabel, { fontSize: 12, fontWeight: 'bold', color: '#0f172a' }]}>Total ({payment.currency || 'USD'})</Text>
                            <Text style={styles.grandTotal}>{formatCurrency(amount, payment.currency)}</Text>
                        </View>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Thank you for your business!</Text>
                    <Text style={styles.footerText}>Questions? Email us at {process.env.EMAIL_FROM || 'support@dummyticket.com'}</Text>
                    <Text style={[styles.footerText, { marginTop: 10, opacity: 0.5 }]}>
                        This is a computer-generated document. No signature is required.
                    </Text>
                </View>

            </Page>
        </Document>
    );
};

export default InvoicePDF;
