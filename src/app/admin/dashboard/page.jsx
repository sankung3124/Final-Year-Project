"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import {
  Activity,
  Truck,
  Users,
  Scale,
  CheckCircle,
  Clock,
  MapPin,
  Building,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";

export default function AdminDashboard() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [stats, setStats] = useState(null);
  const [localGovernment, setLocalGovernment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const lgResponse = await axios.get(
          `/api/users/${session?.session.user.id}/local-government`
        );
        if (lgResponse.data.success) {
          setLocalGovernment(lgResponse.data.data);
        }
        const statsResponse = await axios.get(
          `/api/dashboard/stats?localGovernment=${lgResponse.data.data._id}`
        );
        setStats(statsResponse.data.data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (session?.session?.user?.id) {
      fetchData();
    }
  }, [session]);

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
          {localGovernment
            ? `${localGovernment.name} Dashboard`
            : "Admin Dashboard"}
        </h1>
        <p className="text-gray-600">
          Welcome back, {session?.user?.firstName}! Here's an overview of{" "}
          {localGovernment ? localGovernment.name : "your"} waste management
          system.
        </p>
      </div>

      {localGovernment && (
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <Building className="h-8 w-8 text-primary mr-4" />
              <div>
                <h2 className="text-xl font-semibold">
                  {localGovernment.name}
                </h2>
                <p className="text-gray-600">{localGovernment.region}</p>
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              You are managing the waste collection operations for{" "}
              {localGovernment.name}. As an administrator, you can create users,
              assign vehicles, and monitor pickups.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                  {stats?.pickupCount || 0}
                </div>
                <p className="text-xs text-gray-500">All time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Registered Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="w-8 h-8 text-indigo-500 mr-2" />
              <div>
                <div className="text-2xl font-bold">
                  {stats?.userCount || 0}
                </div>
                <p className="text-xs text-gray-500">Active accounts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Available Vehicles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Truck className="w-8 h-8 text-green-500 mr-2" />
              <div>
                <div className="text-2xl font-bold">
                  {stats?.vehicleCount || 0}
                </div>
                <p className="text-xs text-gray-500">In service</p>
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

      <div className="mb-8">
        <h2 className="text-xl font-semibold text-secondary mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/admin/users/new">
            <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                <Users className="h-10 w-10 text-primary mb-3" />
                <h3 className="font-medium">Add User</h3>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/vehicles/new">
            <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                <Truck className="h-10 w-10 text-indigo-500 mb-3" />
                <h3 className="font-medium">Add Vehicle</h3>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/drivers/new">
            <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                <Users className="h-10 w-10 text-blue-500 mb-3" />
                <h3 className="font-medium">Add Driver</h3>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/reports">
            <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                <Activity className="h-10 w-10 text-green-500 mb-3" />
                <h3 className="font-medium">Generate Reports</h3>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-secondary">
            Recent Pickups
          </h2>
          <Link href="/admin/pickups">
            <Button variant="ghost" size="sm" className="text-primary">
              View All
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
