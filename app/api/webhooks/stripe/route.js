import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin"; // Use admin client
import { createBookingFromSession } from "@/lib/bookings";
import { sendWhatsAppBookingConfirmation } from "@/lib/whatsapp";

export async function POST(req) {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error(`Webhook signature verification failed.`, err.message);
        return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Handle the event
    switch (event.type) {
        case "checkout.session.completed":
            const session = event.data.object;
            const metadata = session.metadata;

            if (metadata?.booking_id) {
                try {
                    const result = await createBookingFromSession(session, supabase);

                    // Generate PDF for the booking
                    let pdfBuffer = null;
                    if (result.success && result.booking) {
                        try {
                            const { generateBookingPDF } = await import('@/lib/pdf-generator');
                            pdfBuffer = await generateBookingPDF(result.booking);
                        } catch (pdfError) {
                            console.error('PDF generation failed:', pdfError);
                            // Continue without PDF if generation fails
                        }

                        // Send notification to Admin (NO PDF)
                        try {
                            const { sendEmail } = await import('@/lib/email');
                            const { getAdminBookingNotificationEmail } = await import('@/lib/email-templates');

                            const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_FROM;

                            const adminEmailOptions = {
                                to: adminEmail,
                                subject: `New Booking - ${result.booking.id}`,
                                html: getAdminBookingNotificationEmail(result.booking)
                            };

                            const adminEmailResult = await sendEmail(adminEmailOptions);
                            if (!adminEmailResult.success) {
                                console.error('Error in sendEmail for admin:', adminEmailResult.error);
                            }
                        } catch (adminEmailError) {
                            console.error('Failed to send admin notification email:', adminEmailError);
                        }
                    }

                    // Send WhatsApp notification if delivery method is 'whatsapp'
                    if (result.success && result.booking && result.booking.passenger_details?.deliveryMethod === 'whatsapp') {
                        const whatsappNumber = result.booking.passenger_details.whatsappNumber;
                        if (whatsappNumber) {
                            await sendWhatsAppBookingConfirmation(whatsappNumber, result.booking, pdfBuffer);
                        }

                        // Also send email with PDF for WhatsApp delivery
                        const deliveryEmail = result.booking.passenger_details.whatsappEmail || result.booking.passenger_details.email;
                        if (deliveryEmail) {
                            const { sendEmail } = await import('@/lib/email');
                            const { getBookingConfirmationEmail } = await import('@/lib/email-templates');

                            const emailOptions = {
                                to: deliveryEmail,
                                subject: `✈️ Booking Confirmed - ${result.booking.id}`,
                                html: getBookingConfirmationEmail(result.booking)
                            };

                            // Attach PDF if available
                            if (pdfBuffer) {
                                emailOptions.attachments = [{
                                    filename: `Booking_Receipt_${result.booking.id}.pdf`,
                                    content: pdfBuffer
                                }];
                            }

                            await sendEmail(emailOptions);
                        }
                    }

                    // Send Email notification if delivery method is 'email'
                    if (result.success && result.booking && result.booking.passenger_details?.deliveryMethod === 'email') {
                        const deliveryEmail = result.booking.passenger_details.deliveryEmail || result.booking.passenger_details.email;
                        if (deliveryEmail) {
                            const { sendEmail } = await import('@/lib/email');
                            const { getBookingConfirmationEmail } = await import('@/lib/email-templates');

                            const emailOptions = {
                                to: deliveryEmail,
                                subject: `✈️ Booking Confirmed - ${result.booking.id}`,
                                html: getBookingConfirmationEmail(result.booking)
                            };

                            // Attach PDF if available
                            if (pdfBuffer) {
                                emailOptions.attachments = [{
                                    filename: `Booking_Receipt_${result.booking.id}.pdf`,
                                    content: pdfBuffer
                                }];
                            }

                            await sendEmail(emailOptions);
                        }
                    }
                } catch (err) {
                    console.error("Error processing booking in webhook:", err);
                    return NextResponse.json({ error: "Booking creation failed" }, { status: 500 });
                }
            }
            break;

        // Add other event types if needed (e.g., payment_intent.payment_failed)
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
}
