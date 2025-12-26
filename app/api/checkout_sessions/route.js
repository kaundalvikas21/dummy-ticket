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

        // Generate Custom ID: TKT-{YEAR}-{SHORT_HASH}
        const year = new Date().getFullYear();
        const hash = Math.random().toString(16).substring(2, 8).toUpperCase();
        const customId = `TKT-${year}-${hash}`;

        // 1. Prepare metadata by splitting formData (max 500 chars per field)
        const meta_passenger = JSON.stringify({
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            passport: formData.passportNumber,
            dob: formData.dateOfBirth,
            gender: formData.gender,
            nationality: formData.nationality
        });

        const meta_travel = JSON.stringify({
            dep_city: formData.departureCity,
            arr_city: formData.arrivalCity,
            dep_date: formData.departureDate,
            ret_date: formData.tripType === "one-way" ? "" : formData.returnDate,
            class: formData.travelClass,
            trip: formData.tripType
        });

        const meta_delivery = JSON.stringify({
            method: formData.deliveryMethod,
            email: formData.deliveryEmail,
            wa: formData.whatsappNumber
        });

        const meta_billing = JSON.stringify({
            name: formData.billingName,
            addr: formData.billingAddress,
            city: formData.billingCity,
            zip: formData.billingZip,
            country: formData.billingCountry
        });

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

        // Determine payment method types
        let payment_method_types = ["card"];
        if (formData.paymentMethod === "amazon_pay") {
            payment_method_types = ["amazon_pay"];
        }
        // "apple_pay" is handled via "card" in Stripe Checkout

        const session = await stripe.checkout.sessions.create({
            payment_method_types,
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
                booking_id: customId,
                user_id: user?.id || "guest",
                plan_id: planId,
                amount: amount.toString(),
                currency: currency,
                meta_passenger,
                meta_travel,
                meta_delivery,
                meta_billing
            },
        });

        return NextResponse.json({ sessionId: session.id, url: session.url });
    } catch (error) {
        console.error("Stripe Checkout Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
