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

                    // Send WhatsApp notification if delivery method is 'whatsapp'
                    if (result.success && result.booking && result.booking.passenger_details?.deliveryMethod === 'whatsapp') {
                        const whatsappNumber = result.booking.passenger_details.whatsappNumber;
                        if (whatsappNumber) {
                            await sendWhatsAppBookingConfirmation(whatsappNumber, result.booking);
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
