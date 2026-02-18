import { PaymentHistory } from "@/components/dashboard/user/payment-history"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { formatBookingData } from "@/lib/formatters"

export default async function PaymentsPage() {
  const supabase = await createClient()

  const { data, error: authError } = await supabase.auth.getUser()
  const user = data?.user
  if (authError || !user) {
    redirect("/login")
  }

  // Fetch only paid bookings for payment history
  const { data: paymentsData, error } = await supabase
    .from("bookings")
    .select(`
      *,
      service_plans (
        name
      )
    `)
    .eq("user_id", user.id)
    .eq("status", "paid")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching payments:", error)
  }

  const mappedPayments = (paymentsData || []).map(p => {
    const formatted = formatBookingData(p);
    return {
      ...formatted,
      id: formatted.transactionId, // Payment History expects 'id' to be the transaction ID
      bookingId: formatted.id      // and 'bookingId' to be the Ticket ID
    };
  });

  return <PaymentHistory initialPayments={mappedPayments} />
}
