import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin"; // Use admin client

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
            const bookingId = session.metadata?.booking_id;

            if (bookingId) {
                // Update booking status to 'paid'
                // Also store payment intent ID for future reference
                const { error } = await supabase
                    .from("bookings")
                    .update({
                        status: "paid",
                        payment_intent_id: session.payment_intent
                    })
                    .eq("id", bookingId);

                if (error) {
                    console.error("Error updating booking:", error);
                    return NextResponse.json({ error: "Database update failed" }, { status: 500 });
                }
            }
            break;

        // Add other event types if needed (e.g., payment_intent.payment_failed)
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
}
