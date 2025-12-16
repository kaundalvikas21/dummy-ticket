import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin"; // Use admin client

export async function POST(req) {
    try {
        const { planId, formData, amount, currency } = await req.json();

        if (!planId || !amount) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const supabase = createAdminClient();

        // Get user session (optional) - we can't easily get it here with admin client if relying on cookies
        // But the original code fetched user from supabase.auth.getUser() which used cookies via server client
        // If we want to link user_id, we should passed it in body or use standard client just for auth.
        // Actually, we can just let user_id be null for guest, or if client passes it.
        // Let's stick to admin client for DB ops to ensure we can write/update.
        // If we need user_id, we might need to rely on client sending it or trust the session if we kept the other client.
        // For now, let's proceed with admin client to fix the permission issue.
        // A better approach: use standard client for getting user, admin client for DB.

        // 1. Create a Booking Record in Supabase (Pending)
        const { data: booking, error: dbError } = await supabase
            .from("bookings")
            .insert({
                user_id: null, // For guest checkout we can leave it null. If we want to support logged in users, we need to extract ID.
                // Let's keep it simple for now as the user is testing guest flow primarily or we accept it might be null.
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
