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
import { useAuth } from "@/contexts/auth-context";

export function UserDashboard() {
  const { user, profile } = useAuth(); 
  const router = useRouter();

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
      value: "12",
      icon: Ticket,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Active Bookings",
      value: "3",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Completed",
      value: "9",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Upcoming Trips",
      value: "2",
      icon: Calendar,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  const upcomingBookings = [
    {
      id: "TKT-12345",
      route: "New York → London",
      date: "Dec 25, 2024",
      status: "Confirmed",
      type: "Visa Ticket",
    },
    {
      id: "TKT-12346",
      route: "Paris → Tokyo",
      date: "Jan 15, 2025",
      status: "Processing",
      type: "Return Ticket",
    },
  ];

  const recentActivity = [
    {
      action: "Booking Confirmed",
      ticket: "TKT-12345",
      time: "2 hours ago",
    },
    {
      action: "Payment Processed",
      ticket: "TKT-12346",
      time: "1 day ago",
    },
    {
      action: "Document Downloaded",
      ticket: "TKT-12344",
      time: "3 days ago",
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome Banner */}
      <Card className="bg-gradient-to-r from-blue-600 to-teal-500 text-white">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-bold mb-2">
                Welcome back, {profile?.first_name || user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'User'}!
              </h2>
              <p className="text-blue-100 text-sm sm:text-base">
                You have 2 upcoming trips. Ready for your next adventure?
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
            <Card key={stat.title}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">{stat.title}</p>
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
              {upcomingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-lg border p-3 sm:p-4 gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-blue-100 flex-shrink-0">
                      <Plane className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm sm:text-base">{booking.route}</p>
                      <p className="text-sm text-gray-600">{booking.id}</p>
                      <p className="text-xs sm:text-sm text-gray-500">{booking.date}</p>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-start sm:items-end gap-2 sm:gap-1">
                    <Badge
                      variant={
                        booking.status === "Confirmed" ? "default" : "secondary"
                      }
                      className="text-xs"
                    >
                      {booking.status}
                    </Badge>
                    <p className="text-xs text-gray-500">{booking.type}</p>
                  </div>
                </div>
              ))}
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
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-3 sm:pb-4 last:border-0 gap-2"
                >
                  <div>
                    <p className="font-medium text-sm sm:text-base">{activity.action}</p>
                    <p className="text-sm text-gray-600">{activity.ticket}</p>
                  </div>
                  <p className="text-sm text-gray-500">{activity.time}</p>
                </div>
              ))}
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
