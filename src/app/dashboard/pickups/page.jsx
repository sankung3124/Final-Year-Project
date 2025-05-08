"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import {
  Calendar,
  Truck,
  Clock,
  Filter,
  Search,
  PlusCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

export default function MyPickups() {
  const { toast } = useToast();
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchPickups();
  }, [statusFilter]);

  const fetchPickups = async () => {
    setLoading(true);
    try {
      let url = "/api/pickups";
      if (statusFilter !== "all") {
        url += `?status=${statusFilter}`;
      }

      const response = await axios.get(url);
      setPickups(response.data.data);
    } catch (error) {
      console.error("Error fetching pickups:", error);
      toast({
        title: "Error",
        description: "Failed to load pickups",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelPickup = async (id) => {
    if (!confirm("Are you sure you want to cancel this pickup?")) {
      return;
    }

    try {
      await axios.put(`/api/pickups/${id}`, { status: "cancelled" });
      toast({
        title: "Pickup Cancelled",
        description: "Your pickup has been successfully cancelled",
        variant: "success",
      });
      fetchPickups();
    } catch (error) {
      console.error("Error cancelling pickup:", error);
      toast({
        title: "Error",
        description: "Failed to cancel pickup",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "requested":
        return "bg-blue-100 text-blue-800";
      case "scheduled":
        return "bg-indigo-100 text-indigo-800";
      case "assigned":
        return "bg-purple-100 text-purple-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredPickups = pickups.filter((pickup) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      pickup.wasteDescription.toLowerCase().includes(query) ||
      pickup.location.address.toLowerCase().includes(query) ||
      pickup.location.city.toLowerCase().includes(query) ||
      pickup.status.toLowerCase().includes(query)
    );
  });

  // Sort pickups by scheduled date (most recent first)
  const sortedPickups = [...filteredPickups].sort((a, b) => {
    return new Date(b.scheduledDate) - new Date(a.scheduledDate);
  });

  // Group pickups by status
  const upcomingPickups = sortedPickups.filter((pickup) =>
    ["requested", "scheduled", "assigned", "in_progress"].includes(
      pickup.status
    )
  );

  const pastPickups = sortedPickups.filter((pickup) =>
    ["completed", "cancelled"].includes(pickup.status)
  );

  return (
    <div>
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-secondary mb-2">
              My Pickups
            </h1>
            <p className="text-gray-600">
              View and manage your waste collection requests
            </p>
          </div>
          <Link href="/dashboard/schedule">
            <Button className="mt-4 sm:mt-0">
              <PlusCircle className="mr-2 h-4 w-4" />
              Schedule New Pickup
            </Button>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search pickups..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center">
            <Filter className="mr-2 h-4 w-4 text-gray-500" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Pickups</SelectItem>
                <SelectItem value="requested">Requested</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-8">
          {upcomingPickups.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-secondary mb-4">
                Upcoming Pickups
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingPickups.map((pickup) => (
                  <div
                    key={pickup._id}
                    className="bg-white rounded-lg shadow-md overflow-hidden border-l-4 border-primary"
                  >
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-secondary">
                            {pickup.pickupType.charAt(0).toUpperCase() +
                              pickup.pickupType.slice(1)}{" "}
                            Waste
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-1">
                            {pickup.wasteDescription}
                          </p>
                        </div>
                        <Badge className={getStatusColor(pickup.status)}>
                          {pickup.status.charAt(0).toUpperCase() +
                            pickup.status.slice(1).replace("_", " ")}
                        </Badge>
                      </div>

                      <div className="flex items-center mb-2">
                        <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-sm">
                          {new Date(pickup.scheduledDate).toLocaleDateString(
                            undefined,
                            {
                              weekday: "short",
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </span>
                      </div>

                      <div className="flex items-center mb-2">
                        <Clock className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-sm capitalize">
                          {pickup.preferredTimeSlot} (
                          {pickup.preferredTimeSlot === "morning"
                            ? "8am - 12pm"
                            : pickup.preferredTimeSlot === "afternoon"
                            ? "12pm - 4pm"
                            : "4pm - 8pm"}
                          )
                        </span>
                      </div>

                      <div className="flex items-center">
                        <Truck className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-sm">
                          {pickup.vehicle
                            ? `Vehicle: ${pickup.vehicle.registrationNumber}`
                            : "Awaiting vehicle assignment"}
                        </span>
                      </div>

                      <div className="mt-4 flex justify-end gap-2">
                        <Link href={`/dashboard/pickups/${pickup._id}`}>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </Link>
                        {["requested", "scheduled"].includes(pickup.status) && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => cancelPickup(pickup._id)}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pastPickups.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-secondary mb-4">
                Past Pickups
              </h2>
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
                    {pastPickups.map((pickup) => (
                      <tr key={pickup._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(
                              pickup.scheduledDate
                            ).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500 capitalize">
                            {pickup.preferredTimeSlot}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 capitalize">
                            {pickup.pickupType}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                              pickup.status
                            )}`}
                          >
                            {pickup.status.charAt(0).toUpperCase() +
                              pickup.status.slice(1).replace("_", " ")}
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
            </div>
          )}

          {pickups.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No pickups found
              </h3>
              <p className="text-gray-500 mb-6">
                You haven't scheduled any waste pickups yet.
              </p>
              <Link href="/dashboard/schedule">
                <Button>Schedule Your First Pickup</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
