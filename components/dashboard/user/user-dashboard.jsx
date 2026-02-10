"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Ticket,
  Clock,
  CheckCircle,
  Calendar,
  Plane,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { CURRENCY_SYMBOLS } from "@/lib/exchange-rate";

const getBadgeStyle = (status) => {
  switch (status?.toLowerCase()) {
    case "active":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "confirmed":
    case "paid":
      return "bg-green-100 text-green-800 border-green-200";
    case "processing":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "completed":
      return "bg-green-100 text-green-800 border-green-200";
    case "cancelled":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export function UserDashboard({ statsData, upcomingBookingsData, recentActivityData, userName }) {
  const router = useRouter();

  // Use a cleaner fallback if userName is still questionable
  const displayUserName = userName === 'Unknown' || !userName ? 'User' : userName;

  const handleBookTicket = () => {
    router.push("/buy-ticket");
  };

  const handleViewAllBookings = () => {
    router.push("/user/bookings");
  };

  const handleTrackBooking = () => {
    router.push("/user/bookings");
  };


  const stats = [
    {
      title: "Total Bookings",
      value: statsData?.total || 0,
      icon: Ticket,
      color: "text-blue-600",
      bgColor: "bg-blue-200",
      cardBgColor: "bg-blue-100",
    },
    {
      title: "Active Bookings",
      value: statsData?.active || 0,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-200",
      cardBgColor: "bg-orange-100",
    },
    {
      title: "Completed",
      value: statsData?.completed || 0,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-200",
      cardBgColor: "bg-green-100",
    },
    {
      title: "Upcoming Trips",
      value: statsData?.upcoming || 0,
      icon: Calendar,
      color: "text-purple-600",
      bgColor: "bg-purple-200",
      cardBgColor: "bg-purple-100",
    },
  ];

  const upcomingBookings = upcomingBookingsData || [];
  const recentActivity = recentActivityData || [];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome Banner */}
      <Card className="bg-gradient-to-r from-blue-600 to-teal-500 text-white">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-bold mb-2">
                Welcome back, {displayUserName}!
              </h2>
              <p className="text-blue-100 text-sm sm:text-base">
                You have {statsData?.upcoming || 0} upcoming trip{(statsData?.upcoming || 0) !== 1 ? 's' : ''}. Ready for your next adventure?
              </p>
            </div>

            <Button
              className="w-full sm:w-auto bg-white text-blue-600 hover:bg-blue-50 cursor-pointer min-h-[44px] px-6 py-3"
              onClick={handleBookTicket}
            >
              Book New Ticket
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className={`${stat.cardBgColor} hover:bg-white duration-300 ease-in-out`}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-lg font-bold text-gray-600">{stat.title}</p>
                    <p className="text-2xl sm:text-3xl font-bold mt-2">{stat.value}</p>
                  </div>
                  <div className={`${stat.bgColor} p-2 sm:p-3 rounded-lg flex-shrink-0 ml-4`}>
                    <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Upcoming Bookings */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between text-lg sm:text-xl">
              <span>Upcoming Bookings</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleViewAllBookings}
                className="min-h-[40px] touch-manipulation"
              >
                View All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {upcomingBookings.length > 0 ? (
                upcomingBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-lg border p-3 sm:p-4 gap-3 hover:bg-gray-100 hover:border-blue-200 transition-colors duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-blue-100 flex-shrink-0">
                        <Plane className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center bg-blue-50/50 px-1.5 py-0.5 rounded border border-blue-100/30">
                            <span className="text-[12px] font-bold text-blue-700">{booking.departure}</span>
                          </div>
                          <span className="text-gray-400 text-xs">→</span>
                          <div className="flex items-center bg-emerald-50/50 px-1.5 py-0.5 rounded border border-emerald-100/30">
                            <span className="text-[12px] font-bold text-emerald-700">{booking.arrival}</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">ID: {booking.id}</p>
                        <p className="text-xs text-gray-500">{booking.date}</p>
                      </div>
                    </div>
                    <div className="flex sm:flex-col items-start sm:items-end gap-2 sm:gap-1">
                      <Badge
                        className={`text-xs ${getBadgeStyle(booking.status)}`}
                      >
                        {booking.status}
                      </Badge>
                      <p className="text-xs text-gray-500">{booking.type}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No upcoming trips.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b py-3 sm:py-4 last:border-0 gap-2 hover:bg-gray-100 transition-colors duration-200 rounded-lg px-2"
                  >
                    <div>
                      <p className="font-medium text-sm sm:text-base">{activity.action}</p>
                      <p className="text-sm text-gray-600">{activity.ticket}</p>
                    </div>
                    <p className="text-sm text-gray-500">{activity.time}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No recent activity.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            <Button
              className="h-auto flex-col gap-2 py-4 sm:py-6 bg-transparent border-2 min-h-[80px] touch-manipulation"
              variant="outline"
              onClick={handleBookTicket}
            >
              <Ticket className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-sm sm:text-base">Book New Ticket</span>
            </Button>
            <Button
              className="h-auto flex-col gap-2 py-4 sm:py-6 bg-transparent border-2 min-h-[80px] touch-manipulation"
              variant="outline"
              onClick={handleTrackBooking}
            >
              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-sm sm:text-base">Track Booking</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
