export async function createBookingFromSession(session, supabaseAdmin) {
    const metadata = session.metadata;

    if (!metadata?.booking_id) {
        throw new Error("Missing booking_id in session metadata");
    }

    // Check if booking already exists to avoid duplicates
    // Select * to ensure we get all details for the success page
    const { data: existingBooking } = await supabaseAdmin
        .from("bookings")
        .select("*")
        .eq("stripe_session_id", session.id)
        .single();

    if (existingBooking) {
        return { success: true, message: "Booking already exists", booking: existingBooking };
    }

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
    const { data, error } = await supabaseAdmin
        .from("bookings")
        .insert({
            id: metadata.booking_id,
            user_id: metadata.user_id === "guest" ? null : metadata.user_id,
            plan_id: metadata.plan_id,
            amount: metadata.amount ? parseFloat(metadata.amount) : (session.amount_total / 100),
            currency: metadata.currency || session.currency?.toUpperCase() || 'USD',
            status: "paid",
            stripe_session_id: session.id,
            payment_intent_id: typeof session.payment_intent === 'string'
                ? session.payment_intent
                : session.payment_intent?.id,
            payment_method: metadata.payment_method || "Credit Card",
            passenger_details: passenger_details
        })
        .select()
        .single();

    if (error) {
        // Handle specific error for duplicate key if race condition occurred
        if (error.code === '23505') {
            // In case of race condition, fetch the record that was just created
            const { data: racerBooking } = await supabaseAdmin
                .from("bookings")
                .select("*")
                .eq("stripe_session_id", session.id)
                .single();

            return {
                success: true,
                message: "Booking already exists (race condition handled)",
                booking: racerBooking
            };
        }
        console.error("Error creating booking in database:", error);
        throw new Error("Database insertion failed: " + error.message);
    }

    return { success: true, booking: data };
}
