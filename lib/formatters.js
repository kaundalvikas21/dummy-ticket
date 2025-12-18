/**
 * Formats a raw booking object from Supabase into a structured object for UI components.
 * Handles JSON pasing of passenger_details and default value fallbacks.
 * 
 * @param {Object} booking - Raw booking object from database
 * @returns {Object} Formatted booking object
 */
export function formatBookingData(booking) {
    if (!booking) return null;

    let details = {};
    try {
        details = typeof booking.passenger_details === 'string'
            ? JSON.parse(booking.passenger_details)
            : booking.passenger_details || {};
    } catch (e) {
        console.error("Error parsing passenger details for booking", booking.id, e);
    }

    const departure = details.departureCity || "";
    const arrival = details.arrivalCity || "";
    const planName = booking.service_plans?.name || "Service";

    // Format dates
    const createdDate = new Date(booking.created_at);
    const formattedCreatedDate = createdDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    // Use departure date if available, else created date
    const travelDate = details.departureDate || "N/A";

    // Status formatting (capitalize first letter)
    const statusLabel = booking.status
        ? booking.status.charAt(0).toUpperCase() + booking.status.slice(1)
        : "Pending";

    return {
        // Core IDs
        id: booking.id,
        transactionId: booking.payment_intent_id || "N/A",

        // Dates
        date: travelDate,
        bookingDate: formattedCreatedDate,
        rawDate: createdDate, // For sorting if needed

        // Locations
        route: departure && arrival ? `${departure} → ${arrival}` : "Route Details Unavailable",
        departure: departure || "N/A",
        arrival: arrival || "N/A",

        // Passenger
        passenger: `${details.firstName || ""} ${details.lastName || ""}`.trim() || "Guest",
        email: details.deliveryEmail || details.email || "N/A",
        phone: details.whatsappNumber || details.phone || "N/A",

        // Flight/Service
        type: planName,
        description: `${planName} - ${departure} to ${arrival}`, // Useful for payments page

        // Financials
        amount: booking.amount,
        currency: booking.currency,
        method: "Credit Card", // Default

        // Status
        status: statusLabel,
        rawStatus: booking.status // 'paid', 'pending', etc.
    };
}
