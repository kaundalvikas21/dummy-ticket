import { MyProfile } from "@/components/dashboard/user/my-profile";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatBookingData } from "@/lib/formatters";

export default async function ProfilePage() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect("/login");
  }

  // Fetch all bookings to calculate stats
  const { data: bookingsData } = await supabase
    .from("bookings")
    .select(`
      *,
      service_plans ( name )
    `)
    .eq("user_id", user.id);

  // Calculate stats
  const allBookings = (bookingsData || []).map(formatBookingData);
  const now = new Date();

  const totalBookings = allBookings.length;

  // Total Spent = Sum of amounts for 'paid' bookings
  const totalSpent = allBookings
    .filter(b => b.rawStatus === 'paid')
    .reduce((sum, b) => sum + Number(b.amount || 0), 0);

  // Active = Future bookings (Pending or Paid)
  // Actually, standard logic in dashboard was: Active = Paid & Future. 
  // Let's stick to valid active trips.
  // Or checking "Upcoming" logic from dashboard: status === 'paid' && date >= now.
  const activeBookings = allBookings.filter(b => {
    const d = new Date(b.date !== "N/A" ? b.date : b.rawDate);
    // Be generous with 'Active' on profile - maybe include confirmed future trips
    return ["paid", "confirmed"].includes(b.rawStatus) && d >= now;
  }).length;

  const completedBookings = allBookings.filter(b => {
    const d = new Date(b.date !== "N/A" ? b.date : b.rawDate);
    return ["paid", "confirmed", "completed"].includes(b.rawStatus) && d < now;
  }).length;

  const stats = {
    totalBookings,
    totalSpent,
    activeBookings,
    completedBookings
  };

  return <MyProfile stats={stats} />;
}
