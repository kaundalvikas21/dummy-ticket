import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { renderToBuffer } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: { padding: 40, backgroundColor: '#ffffff', fontFamily: 'Helvetica' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: 20
    },
    title: { fontSize: 32, fontWeight: 'bold', color: '#1e40af', margin: 0 },
    subtitle: { fontSize: 10, color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', marginTop: 6, letterSpacing: 1 },
    grid2: { flexDirection: 'row', gap: 20, marginBottom: 20 },
    card: { flex: 1, border: '1px solid #f1f5f9', borderRadius: 10, padding: 20, backgroundColor: '#ffffff' },
    sectionLabel: {
        fontSize: 10,
        color: '#94a3b8',
        fontWeight: 'bold',
        marginBottom: 15,
        textTransform: 'uppercase',
        letterSpacing: 0.5
    },
    fieldGroup: { marginBottom: 12 },
    fieldLabel: { fontSize: 9, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 },
    fieldValue: { fontSize: 13, fontWeight: 'bold', color: '#1e293b' },
    itineraryCard: { border: '1px solid #f1f5f9', borderRadius: 10, marginBottom: 24, overflow: 'hidden' },
    itineraryHeader: { backgroundColor: '#f8fafc', padding: '10px 20px', borderBottom: '1px solid #f1f5f9' },
    itineraryBody: { padding: '24px 20px' },
    footer: { backgroundColor: '#f8fafc', padding: 20, borderRadius: 10, border: '1px solid #f1f5f9' },
    footerText: { fontSize: 9, color: '#64748b', lineHeight: 1.6 }
});

const BookingPDFDocument = ({ booking }) => {
    const p = booking.passenger_details;
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>{process.env.APP_NAME || 'Dummy Ticket'}</Text>
                        <Text style={styles.subtitle}>Booking Recipient</Text>
                    </View>
                    <View style={{ textAlign: 'right' }}>
                        <Text style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>
                            Date: {formatDate(booking.created_at)}
                        </Text>
                        <Text style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'Courier', marginTop: 4 }}>
                            Ref: {booking.id}
                        </Text>
                    </View>
                </View>

                {/* Booking & Transaction Details */}
                <View style={styles.grid2}>
                    <View style={styles.card}>
                        <Text style={styles.sectionLabel}>Passenger & Booking Info</Text>

                        {/* Row 1: Name & Email */}
                        <View style={{ flexDirection: 'row', gap: 20 }}>
                            <View style={[styles.fieldGroup, { flex: 1 }]}>
                                <Text style={styles.fieldLabel}>Lead Passenger</Text>
                                <Text style={styles.fieldValue}>{p.firstName} {p.lastName}</Text>
                            </View>
                            <View style={[styles.fieldGroup, { flex: 1 }]}>
                                <Text style={styles.fieldLabel}>Passenger Email</Text>
                                <Text style={[styles.fieldValue, { fontSize: 12 }]}>{p.deliveryEmail || p.email}</Text>
                            </View>
                        </View>

                        {/* Row 2: Booking ID & Service Type */}
                        <View style={{ flexDirection: 'row', gap: 20 }}>
                            <View style={[styles.fieldGroup, { flex: 1 }]}>
                                <Text style={styles.fieldLabel}>Booking ID</Text>
                                <Text style={[styles.fieldValue, { fontSize: 12, color: '#475569' }]}>{booking.id}</Text>
                            </View>
                            <View style={[styles.fieldGroup, { flex: 1 }]}>
                                <Text style={styles.fieldLabel}>Service Type</Text>
                                <Text style={[styles.fieldValue, { color: '#2563eb' }]}>
                                    {booking.service_plan_name || booking.type || 'Standard Ticket'}
                                </Text>
                            </View>
                        </View>

                        {/* Row 3: Nationality & Passport */}
                        <View style={{ flexDirection: 'row', gap: 20 }}>
                            <View style={[styles.fieldGroup, { flex: 1 }]}>
                                <Text style={styles.fieldLabel}>Nationality</Text>
                                <Text style={styles.fieldValue}>{p.nationality || 'N/A'}</Text>
                            </View>
                            <View style={[styles.fieldGroup, { flex: 1 }]}>
                                <Text style={styles.fieldLabel}>Passport</Text>
                                <Text style={styles.fieldValue}>{p.passportNumber || 'N/A'}</Text>
                            </View>
                        </View>

                        {/* Row 4: Trip Type & User ID */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 }}>
                            <View>
                                <Text style={styles.fieldLabel}>Trip Type</Text>
                                <Text style={[styles.fieldValue, { fontSize: 11, textTransform: 'uppercase', color: '#64748b' }]}>
                                    {p.tripType || 'One-Way'}
                                </Text>
                            </View>
                            <View style={{ textAlign: 'right' }}>
                                <Text style={styles.fieldLabel}>User ID</Text>
                                <Text style={{ fontSize: 9, color: '#94a3b8' }}>{booking.user_id || 'Guest User'}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.sectionLabel}>Payment Details</Text>
                        <View style={styles.fieldGroup}>
                            <Text style={styles.fieldLabel}>Transaction ID</Text>
                            <Text style={[styles.fieldValue, { fontSize: 11, fontFamily: 'Courier', color: '#475569' }]}>
                                {booking.payment_intent_id}
                            </Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 10 }}>
                            <View>
                                <Text style={styles.fieldLabel}>Status</Text>
                                <Text style={[styles.fieldValue, { color: '#059669' }]}>PAID</Text>
                            </View>
                            <View style={{ textAlign: 'right' }}>
                                <Text style={styles.fieldLabel}>Amount Paid</Text>
                                <Text style={[styles.fieldValue, { fontSize: 20, color: '#1e293b' }]}>
                                    {booking.currency} {Number(booking.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Itinerary Details */}
                <View style={styles.itineraryCard}>
                    <View style={styles.itineraryHeader}>
                        <Text style={{ fontSize: 10, color: '#6b7280', fontWeight: 'bold', textTransform: 'uppercase' }}>
                            Itinerary Details
                        </Text>
                    </View>
                    <View style={styles.itineraryBody}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.fieldLabel}>From</Text>
                                <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 2 }}>
                                    {p.departureCity}
                                </Text>
                                <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#2563eb', marginTop: 4 }}>
                                    {p.departureDate}
                                </Text>
                            </View>
                            <View style={{ width: 100, alignItems: 'center' }}>
                                <View style={{ width: 60, height: 1, backgroundColor: '#d1d5db', marginBottom: 8 }} />
                                <Text style={{ fontSize: 8, color: '#9ca3af', textTransform: 'uppercase', fontWeight: 'bold' }}>
                                    {p.tripType}
                                </Text>
                            </View>
                            <View style={{ flex: 1, textAlign: 'right' }}>
                                <Text style={styles.fieldLabel}>To</Text>
                                <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 2 }}>
                                    {p.arrivalCity}
                                </Text>
                                {p.returnDate && (
                                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#059669', marginTop: 4 }}>
                                        Return: {p.returnDate}
                                    </Text>
                                )}
                            </View>
                        </View>
                    </View>
                </View>

                {/* Footer Info */}
                <View style={styles.footer}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <View style={{ maxWidth: 450 }}>
                            <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#374151', textTransform: 'uppercase', marginBottom: 8 }}>
                                Important Notes
                            </Text>
                            <Text style={styles.footerText}>
                                • This document serves as a booking confirmation for your dummy ticket.{'\n'}
                                • Valid for 14 days from the date of issue for visa and travel documentation.{'\n'}
                                • For further assistance or manual verification, visit www.getdummytickets.co.
                            </Text>
                        </View>
                        <View style={{ textAlign: 'right' }}>
                            <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#1e40af', margin: 0 }}>
                                {process.env.APP_NAME || 'Dummy Ticket'} Support
                            </Text>
                            <Text style={{ fontSize: 9, color: '#6b7280', marginTop: 4 }}>
                                {process.env.EMAIL_FROM || 'team@comm.getdummytickets.co'}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={{ marginTop: 24, textAlign: 'center', opacity: 0.4 }}>
                    <Text style={{ fontSize: 8, margin: 0 }}>
                        This is an automated acknowledgment. No physical signature is required.
                    </Text>
                </View>
            </Page>
        </Document>
    );
};

/**
 * Generate a PDF buffer for a booking receipt
 * @param {Object} booking - Booking object with passenger_details
 * @returns {Promise<Buffer>} PDF file as buffer
 */
export async function generateBookingPDF(booking) {
    try {
        const pdfBuffer = await renderToBuffer(<BookingPDFDocument booking={booking} />);
        return pdfBuffer;
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    }
}
