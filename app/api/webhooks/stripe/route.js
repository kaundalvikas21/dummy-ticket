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
            const metadata = session.metadata;

            if (metadata?.booking_id) {
                // Reconstruct passenger details from split metadata
                const passenger = JSON.parse(metadata.meta_passenger || "{}");
                const travel = JSON.parse(metadata.meta_travel || "{}");
                const delivery = JSON.parse(metadata.meta_delivery || "{}");
                const billing = JSON.parse(metadata.meta_billing || "{}");

                const passenger_details = {
                    firstName: passenger.first_name,
                    lastName: passenger.last_name,
                    email: passenger.email,
                    phone: passenger.phone,
                    passportNumber: passenger.passport,
                    dateOfBirth: passenger.dob,
                    gender: passenger.gender,
                    nationality: passenger.nationality,
                    departureCity: travel.dep_city,
                    arrivalCity: travel.arr_city,
                    departureDate: travel.dep_date,
                    returnDate: travel.ret_date,
                    travelClass: travel.class,
                    tripType: travel.trip,
                    deliveryMethod: delivery.method,
                    deliveryEmail: delivery.email,
                    whatsappNumber: delivery.wa,
                    billingName: billing.name,
                    billingAddress: billing.addr,
                    billingCity: billing.city,
                    billingZip: billing.zip,
                    billingCountry: billing.country
                };

                // Create booking record with status 'paid'
                const { error } = await supabase
                    .from("bookings")
                    .insert({
                        id: metadata.booking_id,
                        user_id: metadata.user_id === "guest" ? null : metadata.user_id,
                        plan_id: metadata.plan_id,
                        amount: parseFloat(metadata.amount),
                        currency: metadata.currency,
                        status: "paid",
                        stripe_session_id: session.id,
                        payment_intent_id: session.payment_intent,
                        passenger_details: passenger_details
                    });

                if (error) {
                    console.error("Error creating booking in webhook:", error);
                    return NextResponse.json({ error: "Database insertion failed" }, { status: 500 });
                }
            }
            break;

        // Add other event types if needed (e.g., payment_intent.payment_failed)
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
}
