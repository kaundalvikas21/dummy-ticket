import { UserDashboard } from '@/components/dashboard/user/user-dashboard';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import React from 'react';
import { formatBookingData } from '@/lib/formatters';

const UserDashboardPage = async () => {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  // Fetch user profile for name
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('first_name, last_name')
    .eq('auth_user_id', user.id)
    .single();

  const getDisplayName = () => {
    const fName = profile?.first_name || '';
    const lName = profile?.last_name || '';

    if (fName && fName !== 'Unknown') {
      if (!lName || lName === fName) return fName;
      return `${fName} ${lName}`.trim();
    }
    // Fallback to Google metadata
    if (user.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user.user_metadata?.given_name) return user.user_metadata.given_name;
    return user.email?.split('@')[0] || 'User';
  };

  // Fetch all bookings
  const { data: bookings, error: dbError } = await supabase
    .from('bookings')
    .select(`
            *,
            service_plans (
                name
            )
        `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (dbError) {
    console.error("Error fetching bookings:", dbError);
  }

  // Normalize data using shared formatter
  const formattedBookings = (bookings || []).map(formatBookingData);
  const now = new Date();

  // Calculate Stats using normalized data
  let activeCount = 0;
  let completedCount = 0;
  let upcomingCount = 0;

  formattedBookings.forEach(booking => {
    const bookingDate = new Date(booking.date !== "N/A" ? booking.date : booking.rawDate);

    // "Active" = Paid & Future or Today
    if (booking.rawStatus === 'paid' && bookingDate >= now) {
      activeCount++;
      upcomingCount++;
    }
    // "Completed" = Paid & Past
    else if (booking.rawStatus === 'paid' && bookingDate < now) {
      completedCount++;
    }
  });

  const stats = {
    total: formattedBookings.length,
    active: activeCount,
    completed: completedCount,
    upcoming: upcomingCount
  };

  // Prepare Upcoming Bookings (Top 2 Future Paid/Pending)
  const upcomingList = formattedBookings
    .filter(b => {
      const d = new Date(b.date !== "N/A" ? b.date : b.rawDate);
      return d >= now;
    })
    .sort((a, b) => {
      const dA = new Date(a.date !== "N/A" ? a.date : a.rawDate);
      const dB = new Date(b.date !== "N/A" ? b.date : b.rawDate);
      return dA - dB;
    })
    .slice(0, 2);

  // Helper for relative time
  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };

  // Recent Activity (Top 3 latest)
  // Mapping to props expected by UserDashboard: { action, ticket, time }
  const recentActivity = formattedBookings
    .slice(0, 3)
    .map(b => ({
      action: b.rawStatus === 'paid' ? 'Booking Confirmed' : 'Booking Created',
      ticket: b.id,
      time: timeAgo(new Date(b.rawDate))
    }));

  return (
    <UserDashboard
      statsData={stats}
      upcomingBookingsData={upcomingList}
      recentActivityData={recentActivity}
      userName={getDisplayName()}
    />
  );
};

export default UserDashboardPage;
