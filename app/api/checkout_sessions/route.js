import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin"; // Use admin client

import { createClient } from "@/lib/supabase/server"

import { getExchangeRates } from '@/lib/exchange-rate'

export async function POST(req) {
    try {
        const { planId, formData, amount, currency = 'USD' } = await req.json();

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

        let finalAmount = plan.price;
        let finalCurrency = currency.toUpperCase();

        // Convert currency if not USD
        if (finalCurrency !== 'USD') {
            const rates = await getExchangeRates('USD');
            if (rates && rates[finalCurrency]) {
                finalAmount = plan.price * rates[finalCurrency];
            } else {
                // Fallback to USD if rate not found
                finalCurrency = 'USD';
            }
        }

        // Calculate unit amount (cents for most, 1 for zero-decimal currencies)
        const zeroDecimalCurrencies = ['JPY', 'KRW', 'BIF', 'CLP', 'DJF', 'GNF', 'KMF', 'MGA', 'PYG', 'RWF', 'UGX', 'VND', 'VUV', 'XAF', 'XOF', 'XPF'];
        const isZeroDecimal = zeroDecimalCurrencies.includes(finalCurrency);

        let unitAmount;
        if (isZeroDecimal) {
            unitAmount = Math.round(finalAmount);
        } else {
            unitAmount = Math.round(finalAmount * 100);
        }

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
                        currency: finalCurrency.toLowerCase(),
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
                amount: (unitAmount / 100).toString(),
                currency: currency,
                payment_method: formData.paymentMethod === "card" ? "Credit Card" : (formData.paymentMethod === "amazon_pay" ? "Amazon Pay" : (formData.paymentMethod === "apple_pay" ? "Apple Pay" : formData.paymentMethod)),
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
