import { MyBookings } from "@/components/dashboard/user/my-bookings"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { formatBookingData } from "@/lib/formatters"

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

  // Map to component format using shared formatter
  const mappedBookings = (bookingsData || []).map(formatBookingData);

  return <MyBookings initialBookings={mappedBookings} />
}
