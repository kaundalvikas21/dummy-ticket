import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send an email using Resend
 * 
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} [options.text] - Plain text version of the email
 * @param {string} [options.html] - HTML version of the email
 * @param {string} [options.from] - Sender email address (defaults to EMAIL_FROM env var)
 * @param {Array} [options.attachments] - Array of attachments {filename, content}
 * @returns {Promise<{success: boolean, data?: any, error?: any}>}
 */
export async function sendEmail({ to, subject, text, html, from, attachments }) {
    try {
        const senderName = process.env.MAIL_FROM_NAME || 'Dummy Ticket Support';
        const senderEmail = process.env.EMAIL_FROM || 'team@comm.getdummytickets.co';
        const fromAddress = from || `${senderName} <${senderEmail}>`;

        const emailData = {
            from: fromAddress,
            to,
            subject,
            text,
            html,
        };

        // Add attachments if provided
        if (attachments && attachments.length > 0) {
            emailData.attachments = attachments;
        }

        const { data, error } = await resend.emails.send(emailData);

        if (error) {
            console.error('Resend error:', error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error };
    }
}
