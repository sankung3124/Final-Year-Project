// src/app/driver/dashboard/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import {
  Truck,
  CheckCircle,
  Clock,
  Scale,
  Calendar,
  MapPin,
  User,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";

export default function DriverDashboard() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await axios.get("/api/dashboard/stats");
        setStats(response.data.data);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard stats",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-secondary mb-2">
          Driver Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome back, {session?.user?.firstName}! Here's an overview of your
          assigned pickups.
        </p>
      </div>

      {/* Vehicle Info Card */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-secondary mb-4">
          Your Vehicle
        </h2>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-4 md:mb-0">
                <div className="flex items-center mb-4">
                  <Truck className="h-10 w-10 text-primary mr-4" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {stats?.vehicleInfo?.type || "Loading..."}{" "}
                      <span className="text-base font-normal text-gray-500">
                        (#{stats?.vehicleInfo?.registrationNumber})
                      </span>
                    </h3>
                    <p
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        stats?.vehicleInfo?.status === "available"
                          ? "bg-green-100 text-green-800"
                          : stats?.vehicleInfo?.status === "on_duty"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {stats?.vehicleInfo?.status === "available"
                        ? "Available"
                        : stats?.vehicleInfo?.status === "on_duty"
                        ? "On Duty"
                        : stats?.vehicleInfo?.status || "Unknown"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <Link href="/driver/map">
                  <Button variant="outline" size="sm">
                    <MapPin className="mr-2 h-4 w-4" />
                    View Route
                  </Button>
                </Link>
                <Link href="/driver/settings">
                  <Button size="sm">Update Status</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Assigned Pickups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Truck className="w-8 h-8 text-primary mr-2" />
              <div>
                <div className="text-2xl font-bold">
                  {stats?.assignedPickups || 0}
                </div>
                <p className="text-xs text-gray-500">Total assignments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Completed Pickups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-500 mr-2" />
              <div>
                <div className="text-2xl font-bold">
                  {stats?.completedPickups || 0}
                </div>
                <p className="text-xs text-gray-500">Successfully collected</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Waste Collected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Scale className="w-8 h-8 text-blue-500 mr-2" />
              <div>
                <div className="text-2xl font-bold">
                  {stats?.totalWaste?.toFixed(1) || 0} kg
                </div>
                <p className="text-xs text-gray-500">Your contribution</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-secondary mb-4">
          Today's Schedule
        </h2>

        {stats?.upcomingPickups?.length > 0 ? (
          <div className="space-y-4">
            {stats.upcomingPickups.map((pickup) => (
              <Card key={pickup._id} className="border-l-4 border-primary">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="mb-4 md:mb-0">
                      <div className="flex items-center mb-2">
                        <Calendar className="w-5 h-5 text-primary mr-2" />
                        <span className="font-medium">
                          {new Date(pickup.scheduledDate).toLocaleDateString(
                            "en-GB",
                            {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                            }
                          )}
                        </span>
                      </div>
                      <div className="flex items-center mb-2">
                        <Clock className="w-5 h-5 text-gray-500 mr-2" />
                        <span className="capitalize">
                          {pickup.preferredTimeSlot} (
                          {pickup.preferredTimeSlot === "morning"
                            ? "8am - 12pm"
                            : pickup.preferredTimeSlot === "afternoon"
                            ? "12pm - 4pm"
                            : "4pm - 8pm"}
                          )
                        </span>
                      </div>
                      <div className="flex items-center mb-2">
                        <MapPin className="w-5 h-5 text-gray-500 mr-2" />
                        <span>{pickup.location?.address}</span>
                      </div>
                      <div className="flex items-center">
                        <User className="w-5 h-5 text-gray-500 mr-2" />
                        <span>
                          {pickup.user?.firstName} {pickup.user?.lastName}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <Link href={`/driver/pickups/${pickup._id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                      <Link href={`/driver/pickups/${pickup._id}/update`}>
                        <Button size="sm">Update Status</Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="py-8">
                <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No pickups scheduled for today
                </h3>
                <p className="text-gray-500 mb-6">
                  You don't have any pickups assigned for today.
                </p>
                <Link href="/driver/schedule">
                  <Button>View Schedule</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
