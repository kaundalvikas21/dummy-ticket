import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin"; // Use admin client

import { createClient } from "@/lib/supabase/server"

export async function POST(req) {
    try {
        const { planId, formData, amount, currency } = await req.json();

        if (!planId || !amount) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Get user session using server client
        const supabaseServer = await createClient();
        const { data: { user } } = await supabaseServer.auth.getUser();

        const supabase = createAdminClient();

        // 1. Create a Booking Record in Supabase (Pending)
        const { data: booking, error: dbError } = await supabase
            .from("bookings")
            .insert({
                user_id: user?.id || null,
                plan_id: planId,
                amount: amount,
                currency: currency,
                status: "pending",
                passenger_details: formData,
            })
            .select()
            .single();

        if (dbError) {
            console.error("Database Error:", dbError);
            return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
        }

        // 2. Create Stripe Checkout Session
        // Fetch plan details to ensure price integrity
        const { data: plan } = await supabase
            .from("service_plans")
            .select("*")
            .eq("id", planId)
            .single();

        if (!plan) {
            return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
        }

        const unitAmount = Math.round(plan.price * 100); // USD cents

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: plan.name,
                            description: plan.description || "Travel documentation service",
                        },
                        unit_amount: unitAmount,
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `${req.headers.get("origin")}/buy-ticket/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.get("origin")}/buy-ticket?error=cancelled`,
            metadata: {
                booking_id: booking.id,
            },
        });

        // 3. Update Booking with Session ID
        await supabase
            .from("bookings")
            .update({ stripe_session_id: session.id })
            .eq("id", booking.id);

        return NextResponse.json({ sessionId: session.id, url: session.url });
    } catch (error) {
        console.error("Stripe Checkout Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
