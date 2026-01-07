import twilio from 'twilio';

const getTwilioConfig = () => ({
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    whatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER,
});

let twilioClient = null;
const getClient = () => {
    const { accountSid, authToken } = getTwilioConfig();
    if (!twilioClient && accountSid && authToken) {
        twilioClient = twilio(accountSid, authToken);
    }
    return twilioClient;
};

/**
 * Send a WhatsApp notification for a booking
 * @param {string} to - recipient phone number (with country code)
 * @param {Object} bookingDetails - details to include in the message
 * @param {string} pdfUrl - optional URL to the ticket PDF
 */
export async function sendWhatsAppBookingConfirmation(to, booking, pdfUrl = null) {
    const { accountSid, authToken, whatsappNumber } = getTwilioConfig();
    const client = getClient();

    if (!accountSid || !authToken || !whatsappNumber || !client) {
        console.error('Twilio credentials missing or delivery misconfigured');
        return { success: false, error: 'Twilio credentials missing' };
    }

    // Ensure 'to' is in the correct format: 'whatsapp:+1234567890'
    const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to.startsWith('+') ? '' : '+'}${to}`;

    try {
        const cityName = booking.passenger_details?.arrivalCity || 'destination';
        const passengerName = `${booking.passenger_details?.firstName} ${booking.passenger_details?.lastName}`;

        const messageBody = `*Hello ${passengerName}!* 👋\n\nYour booking with *VisaFly* is confirmed!\n\n📍 *Route:* ${booking.passenger_details?.departureCity} ➡️ ${cityName}\n🆔 *Booking ID:* ${booking.id}\n✅ *Status:* Confirmed & Paid\n\nThank you for choosing VisaFly for your travel documentation!`;

        const messageOptions = {
            body: messageBody,
            from: whatsappNumber,
            to: formattedTo,
        };

        // If we have a PDF URL (stored in Supabase/publicly accessible), we can attach it
        if (pdfUrl) {
            messageOptions.mediaUrl = [pdfUrl];
        }

        const message = await client.messages.create(messageOptions);

        return { success: true, sid: message.sid };
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
        return { success: false, error: error.message };
    }
}
