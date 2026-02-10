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
        // Enrich existing booking with plan name from metadata or DB
        let servicePlanName = metadata.plan_name || existingBooking.type || 'Standard Ticket';
        if (!metadata.plan_name && existingBooking.plan_id) {
            const { data: planData } = await supabaseAdmin
                .from('service_plans')
                .select('name')
                .eq('id', existingBooking.plan_id)
                .single();
            if (planData?.name) servicePlanName = planData.name;
        }

        return {
            success: true,
            message: "Booking already exists",
            booking: { ...existingBooking, service_plan_name: servicePlanName }
        };
    }

    // Reconstruct passenger details from split metadata
    const passenger = JSON.parse(metadata.meta_passenger || "{}");
    const travel = JSON.parse(metadata.meta_travel || "{}");
    const delivery = JSON.parse(metadata.meta_delivery || "{}");
    const billing = JSON.parse(metadata.meta_billing || "{}");

    const capitalizeWords = (str) => {
        if (!str) return "";
        const capitalized = str
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

        // Force IATA code to uppercase (case: "City Name - Code")
        return capitalized.replace(/ - ([a-zA-Z]+)$/, (match, code) => ` - ${code.toUpperCase()}`);
    };

    const passenger_details = {
        firstName: passenger.first_name,
        lastName: passenger.last_name,
        email: passenger.email,
        phone: passenger.phone,
        passportNumber: passenger.passport,
        dateOfBirth: passenger.dob,
        gender: passenger.gender,
        nationality: passenger.nationality,
        departureCity: capitalizeWords(travel.dep_city),
        arrivalCity: capitalizeWords(travel.arr_city),
        departureDate: travel.dep_date,
        returnDate: travel.ret_date,
        travelClass: travel.class,
        tripType: travel.trip,
        deliveryMethod: delivery.method,
        deliveryEmail: delivery.email,
        whatsappNumber: delivery.wa,
        billingName: billing.name,
        billingAddress: billing.addr,
        billingCity: capitalizeWords(billing.city),
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

            // Enrich racer booking with plan name
            let racerPlanName = metadata.plan_name || racerBooking.type || 'Standard Ticket';
            if (!metadata.plan_name && racerBooking.plan_id) {
                const { data: planData } = await supabaseAdmin
                    .from('service_plans')
                    .select('name')
                    .eq('id', racerBooking.plan_id)
                    .single();
                if (planData?.name) racerPlanName = planData.name;
            }

            return {
                success: true,
                message: "Booking already exists (race condition handled)",
                booking: { ...racerBooking, service_plan_name: racerPlanName }
            };
        }
        console.error("Error creating booking in database:", error);
        throw new Error("Database insertion failed: " + error.message);
    }

    // Enrich the successful booking with plan name
    let servicePlanName = metadata.plan_name || data.type || 'Standard Ticket';

    // Only perform DB lookup if metadata.plan_name is completely missing
    if (!metadata.plan_name && data.plan_id) {
        const { data: planData } = await supabaseAdmin
            .from('service_plans')
            .select('name')
            .eq('id', data.plan_id)
            .single();
        if (planData?.name) servicePlanName = planData.name;
    }

    return { success: true, booking: { ...data, service_plan_name: servicePlanName } };
}
