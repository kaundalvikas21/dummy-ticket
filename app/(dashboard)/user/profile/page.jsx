import { MyProfile } from "@/components/dashboard/user/my-profile";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatBookingData } from "@/lib/formatters";
import { getExchangeRates } from "@/lib/exchange-rate";

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

  // Calculate native total if only one currency is present
  const paidBookings = allBookings.filter(b => b.rawStatus === 'paid');
  const uniqueCurrencies = [...new Set(paidBookings.map(b => b.currency || 'USD'))];
  const isMultiCurrency = uniqueCurrencies.length > 1;
  const currencyCode = uniqueCurrencies.length === 1 ? uniqueCurrencies[0] : 'USD';

  const nativeTotalSpent = paidBookings.reduce((sum, b) => sum + Number(b.amount || 0), 0);

  // Total Spent in USD = Convert all paid booking amounts to USD first, then sum
  // This ensures accurate total regardless of individual booking currencies (used for multi-currency fallback)
  const rates = await getExchangeRates('USD');

  const totalSpentUSD = paidBookings.reduce((sum, b) => {
    const amount = Number(b.amount || 0);
    const currency = b.currency || 'USD';

    // Convert to USD if not already USD
    if (currency !== 'USD' && rates && rates[currency]) {
      // Amount is in foreign currency, divide by rate to get USD
      return sum + (amount / rates[currency]);
    }
    // Amount is already in USD (or we couldn't convert)
    return sum + amount;
  }, 0);

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
    totalSpent: isMultiCurrency ? totalSpentUSD : nativeTotalSpent,
    currencyCode,
    isMultiCurrency,
    activeBookings,
    completedBookings
  };

  return <MyProfile stats={stats} />;
}
