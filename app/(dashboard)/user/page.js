import { UserDashboard } from '@/components/dashboard/user/user-dashboard';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import React from 'react';

const UserDashboardPage = async () => {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  // Fetch user profile for name
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('first_name')
    .eq('id', user.id)
    .single();

  // Fetch all bookings for the user with related plan details
  const { data: bookings, error: dbError } = await supabase
    .from('bookings')
    .select(`
            id,
            status,
            created_at,
            amount,
            currency,
            passenger_details,
            plan_id,
            service_plans (
                name
            )
        `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (dbError) {
    console.error("Error fetching bookings:", dbError);
  }

  const allBookings = bookings || [];
  const now = new Date();

  // Helper to get booking date from passenger_details or fallback to created_at
  const getBookingDate = (booking) => {
    if (booking.passenger_details) {
      const details = typeof booking.passenger_details === 'string'
        ? JSON.parse(booking.passenger_details)
        : booking.passenger_details;

      if (details?.departureDate) {
        return new Date(details.departureDate);
      }
    }
    return new Date(booking.created_at);
  };

  // Calculate Stats
  let activeCount = 0;
  let completedCount = 0;
  let upcomingCount = 0;

  allBookings.forEach(booking => {
    const bookingDate = getBookingDate(booking);
    // "Active" = Paid & Future or Today
    if (booking.status === 'paid' && bookingDate >= now) {
      activeCount++;
      upcomingCount++;
    }
    // "Completed" = Paid & Past
    else if (booking.status === 'paid' && bookingDate < now) {
      completedCount++;
    }
  });

  const stats = {
    total: allBookings.length,
    active: activeCount,
    completed: completedCount,
    upcoming: upcomingCount
  };

  // Prepare Upcoming Bookings (Top 2 Future Paid/Pending)
  const upcomingList = allBookings
    .filter(b => {
      const d = getBookingDate(b);
      return d >= now;
    })
    .sort((a, b) => getBookingDate(a) - getBookingDate(b))
    .slice(0, 2)
    .map(b => {
      const details = typeof b.passenger_details === 'string' ? JSON.parse(b.passenger_details) : b.passenger_details || {};
      const departureCity = details.departureCity || 'Origin';
      const arrivalCity = details.arrivalCity || 'Dest';
      const planName = b.service_plans?.name || 'Ticket';

      return {
        id: b.id,
        route: `${departureCity} → ${arrivalCity}`,
        date: getBookingDate(b).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: b.status.charAt(0).toUpperCase() + b.status.slice(1),
        type: planName
      };
    });

  // Prepare Recent Activity (Top 3 most recent actions)
  const recentActivity = allBookings.slice(0, 3).map(b => {
    let action = "Booking Created";
    if (b.status === 'paid') action = "Payment Successful";
    if (b.status === 'cancelled') action = "Booking Cancelled";

    const diffInHours = Math.abs(now - new Date(b.created_at)) / 36e5;
    let timeStr = "";
    if (diffInHours < 1) timeStr = "Just now";
    else if (diffInHours < 24) timeStr = `${Math.floor(diffInHours)} hours ago`;
    else timeStr = `${Math.floor(diffInHours / 24)} days ago`;

    return {
      action: action,
      ticket: b.id,
      time: timeStr
    };
  });

  return (
    <UserDashboard
      statsData={stats}
      upcomingBookingsData={upcomingList}
      recentActivityData={recentActivity}
      userName={profile?.first_name || user?.user_metadata?.first_name || user?.email?.split('@')[0]}
    />
  );
};

export default UserDashboardPage;
