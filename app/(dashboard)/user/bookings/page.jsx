import { MyBookings } from "@/components/dashboard/user/my-bookings"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function BookingsPage() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect("/login")
  }

  // Fetch bookings
  const { data: bookingsData, error } = await supabase
    .from("bookings")
    .select(`
      *,
      service_plans (
        name
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching bookings:", error)
  }

  // Map to component format
  const mappedBookings = (bookingsData || []).map(b => {
    let details = {};
    try {
      details = typeof b.passenger_details === 'string'
        ? JSON.parse(b.passenger_details)
        : b.passenger_details || {};
    } catch (e) {
      console.error("Error parsing passenger details", e);
    }

    const departure = details.departureCity || "";
    const arrival = details.arrivalCity || "";

    return {
      id: b.id,
      route: departure && arrival ? `${departure} → ${arrival}` : "Route Details Unavailable",
      departure: departure || "N/A",
      arrival: arrival || "N/A",
      date: details.departureDate || "N/A",
      passenger: `${details.firstName || ""} ${details.lastName || ""}`.trim() || "Guest",
      email: details.deliveryEmail || details.email || "N/A",
      phone: details.whatsappNumber || details.phone || "N/A",
      type: b.service_plans?.name || "Service",
      status: b.status ? b.status.charAt(0).toUpperCase() + b.status.slice(1) : "Pending",
      amount: b.amount,
      bookingDate: new Date(b.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
  });

  return <MyBookings initialBookings={mappedBookings} />
}
