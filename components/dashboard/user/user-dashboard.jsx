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
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Card className="bg-gradient-to-r from-blue-600 to-teal-500 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Welcome back, {profile?.first_name || user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'User'}!
              </h2>
              <p className="text-blue-100">
                You have 2 upcoming trips. Ready for your next adventure?
              </p>
            </div>

            <Button
              className="bg-white text-blue-600 hover:bg-blue-50 cursor-pointer"
              onClick={handleBookTicket}
            >
              Book New Ticket
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold mt-2">{stat.value}</p>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Bookings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Upcoming Bookings</span>
              <Button variant="ghost" size="sm" onClick={handleViewAllBookings}>
                View All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                      <Plane className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold">{booking.route}</p>
                      <p className="text-sm text-gray-600">{booking.id}</p>
                      <p className="text-sm text-gray-500">{booking.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        booking.status === "Confirmed" ? "default" : "secondary"
                      }
                    >
                      {booking.status}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">{booking.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-b pb-4 last:border-0"
                >
                  <div>
                    <p className="font-medium">{activity.action}</p>
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
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button
              className="h-auto flex-col gap-2 py-6 bg-transparent"
              variant="outline"
              onClick={handleBookTicket}
            >
              <Ticket className="h-6 w-6" />
              <span>Book New Ticket</span>
            </Button>
            <Button
              className="h-auto flex-col gap-2 py-6 bg-transparent"
              variant="outline"
              onClick={handleTrackBooking}
            >
              <CheckCircle className="h-6 w-6" />
              <span>Track Booking</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
