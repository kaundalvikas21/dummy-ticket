import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { renderToBuffer } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: { padding: 32, backgroundColor: '#ffffff', fontFamily: 'Helvetica' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        borderBottom: '1px solid #e5e7eb',
        paddingBottom: 16
    },
    title: { fontSize: 28, fontWeight: 'bold', color: '#1e40af', margin: 0 },
    subtitle: { fontSize: 11, color: '#6b7280', fontWeight: 'bold', textTransform: 'uppercase', marginTop: 4 },
    grid2: { flexDirection: 'row', gap: 24, marginBottom: 24 },
    card: { flex: 1, border: '1px solid #f3f4f6', borderRadius: 8, padding: 16 },
    sectionLabel: {
        fontSize: 10,
        color: '#9ca3af',
        fontWeight: 'bold',
        marginBottom: 12,
        textTransform: 'uppercase'
    },
    fieldLabel: { fontSize: 9, color: '#9ca3af', marginBottom: 2 },
    fieldValue: { fontSize: 14, fontWeight: 'bold', color: '#111827', marginTop: 2 },
    itineraryCard: { border: '1px solid #f3f4f6', borderRadius: 8, marginBottom: 24 },
    itineraryHeader: { backgroundColor: '#f9fafb', padding: '8px 16px', borderBottom: '1px solid #f3f4f6' },
    itineraryBody: { padding: '20px 16px' },
    footer: { backgroundColor: '#f9fafb', padding: 16, borderRadius: 8, border: '1px solid #f3f4f6' },
    footerText: { fontSize: 9, color: '#6b7280', lineHeight: 1.5 }
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
                        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.fieldLabel}>Lead Passenger</Text>
                                <Text style={styles.fieldValue}>{p.firstName} {p.lastName}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.fieldLabel}>Booking ID</Text>
                                <Text style={styles.fieldValue}>{booking.id}</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.fieldLabel}>User ID</Text>
                                <Text style={{ fontSize: 12, fontWeight: 'bold', marginTop: 2 }}>
                                    {booking.user_id || 'Guest User'}
                                </Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.fieldLabel}>Nationality</Text>
                                <Text style={{ fontSize: 13, fontWeight: 'bold', marginTop: 2 }}>
                                    {p.nationality || 'N/A'}
                                </Text>
                            </View>
                        </View>
                        <View style={{ marginTop: 12 }}>
                            <Text style={styles.fieldLabel}>Passport</Text>
                            <Text style={{ fontSize: 13, fontWeight: 'bold', marginTop: 2 }}>
                                {p.passportNumber || 'N/A'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.sectionLabel}>Payment Details</Text>
                        <View style={{ marginBottom: 12 }}>
                            <Text style={styles.fieldLabel}>Transaction ID</Text>
                            <Text style={{ fontSize: 12, fontWeight: 'bold', fontFamily: 'Courier', marginTop: 2 }}>
                                {booking.payment_intent_id}
                            </Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <View>
                                <Text style={styles.fieldLabel}>Status</Text>
                                <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#059669', marginTop: 2 }}>
                                    PAID
                                </Text>
                            </View>
                            <View style={{ textAlign: 'right' }}>
                                <Text style={styles.fieldLabel}>Amount Paid</Text>
                                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827', marginTop: 2 }}>
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
