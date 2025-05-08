"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import {
  Activity,
  Truck,
  Calendar,
  Scale,
  User,
  Clock,
  CheckCircle,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";

export default function Dashboard() {
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
        <h1 className="text-2xl font-bold text-secondary mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back, {session?.user?.firstName}! Here's an overview of your
          waste management activities.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Pickups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Truck className="w-8 h-8 text-primary mr-2" />
              <div>
                <div className="text-2xl font-bold">
                  {stats?.userPickups || 0}
                </div>
                <p className="text-xs text-gray-500">All time</p>
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
              Pending Pickups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-500 mr-2" />
              <div>
                <div className="text-2xl font-bold">
                  {stats?.pendingPickups || 0}
                </div>
                <p className="text-xs text-gray-500">Awaiting collection</p>
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
                <p className="text-xs text-gray-500">Environmental impact</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Next Pickup Card */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-secondary mb-4">
          Next Scheduled Pickup
        </h2>
        {stats?.nextPickup ? (
          <Card className="border-l-4 border-primary">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="mb-4 md:mb-0">
                  <div className="flex items-center mb-2">
                    <Calendar className="w-5 h-5 text-primary mr-2" />
                    <span className="font-medium">
                      {new Date(
                        stats.nextPickup.scheduledDate
                      ).toLocaleDateString("en-GB", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center mb-2">
                    <Clock className="w-5 h-5 text-gray-500 mr-2" />
                    <span>
                      {stats.nextPickup.preferredTimeSlot
                        .charAt(0)
                        .toUpperCase() +
                        stats.nextPickup.preferredTimeSlot.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Trash2 className="w-5 h-5 text-gray-500 mr-2" />
                    <span>{stats.nextPickup.wasteDescription}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Link href={`/dashboard/pickups/${stats.nextPickup._id}`}>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                  <Link
                    href={`/dashboard/schedule?edit=${stats.nextPickup._id}`}
                  >
                    <Button size="sm">Reschedule</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-6">
                <p className="text-gray-500 mb-4">
                  You don't have any upcoming pickups scheduled.
                </p>
                <Link href="/dashboard/schedule">
                  <Button>Schedule a Pickup</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Pickups */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-secondary">
            Recent Pickups
          </h2>
          <Link href="/dashboard/history">
            <Button variant="ghost" size="sm" className="text-primary">
              View All
            </Button>
          </Link>
        </div>

        {stats?.recentPickups?.length > 0 ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Type
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Weight
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recentPickups.map((pickup) => (
                  <tr key={pickup._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(pickup.scheduledDate).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {pickup.preferredTimeSlot}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {pickup.pickupType.charAt(0).toUpperCase() +
                          pickup.pickupType.slice(1)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          pickup.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : pickup.status === "cancelled"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {pickup.status.charAt(0).toUpperCase() +
                          pickup.status.slice(1).replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {pickup.actualWeight
                        ? `${pickup.actualWeight} kg`
                        : pickup.estimatedWeight
                        ? `Est. ${pickup.estimatedWeight} kg`
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/dashboard/pickups/${pickup._id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-primary"
                        >
                          Details
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              No pickup history available.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
