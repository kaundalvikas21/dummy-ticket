import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { createBookingFromSession } from "@/lib/bookings";

export async function POST(req) {
    try {
        const { session_id } = await req.json();

        if (!session_id) {
            return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
        }

        // 1. Retrieve session from Stripe with expanded payment_intent
        const session = await stripe.checkout.sessions.retrieve(session_id, {
            expand: ['payment_intent'],
        });

        if (!session) {
            return NextResponse.json({ error: "Invalid session" }, { status: 404 });
        }

        if (session.payment_status !== "paid") {
            return NextResponse.json({ message: "Payment not complete" }, { status: 400 });
        }

        // 2. Use Admin Client to bypass RLS for write
        const supabase = createAdminClient();

        // 3. Create or confirm booking
        console.log("Verifying payment for session:", session_id);
        const result = await createBookingFromSession(session, supabase);
        console.log("Booking result:", result);

        return NextResponse.json({ success: true, booking: result.booking });

    } catch (error) {
        console.error("Payment verification error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
