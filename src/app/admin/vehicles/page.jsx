"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import Link from "next/link";
import { Truck, Edit, Trash2, Plus, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

export default function AdminVehiclesPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [localGovernment, setLocalGovernment] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get admin's local government
        const lgResponse = await axios.get(
          `/api/users/${session?.session?.user.id}/local-government`
        );
        if (lgResponse.data.success) {
          setLocalGovernment(lgResponse.data.data);
        }

        // Get vehicles from this local government
        const response = await axios.get(
          `/api/vehicles?localGovernment=${lgResponse.data.data._id}`
        );
        setVehicles(response.data.data);
      } catch (error) {
        console.error("Error fetching vehicles:", error);
        toast({
          title: "Error",
          description: "Failed to load vehicles",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (session?.session?.user?.id) {
      fetchData();
    }
  }, [session, toast]);

  const handleDeleteVehicle = async (vehicleId) => {
    if (confirm("Are you sure you want to delete this vehicle?")) {
      try {
        const response = await axios.delete(`/api/vehicles/${vehicleId}`);
        if (response.data.success) {
          setVehicles(vehicles.filter((vehicle) => vehicle._id !== vehicleId));
          toast({
            title: "Success",
            description: "Vehicle deleted successfully",
            variant: "success",
          });
        }
      } catch (error) {
        console.error("Error deleting vehicle:", error);
        toast({
          title: "Error",
          description:
            error.response?.data?.message || "Failed to delete vehicle",
          variant: "destructive",
        });
      }
    }
  };

  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch =
      vehicle.registrationNumber
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (vehicle.driver &&
        `${vehicle.driver.firstName} ${vehicle.driver.lastName}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()));

    const matchesStatus = !statusFilter || vehicle.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const statusMap = {
      available: { label: "Available", color: "bg-green-100 text-green-800" },
      on_duty: { label: "On Duty", color: "bg-blue-100 text-blue-800" },
      maintenance: {
        label: "Maintenance",
        color: "bg-yellow-100 text-yellow-800",
      },
      inactive: { label: "Inactive", color: "bg-gray-100 text-gray-800" },
    };

    const statusInfo = statusMap[status] || {
      label: status,
      color: "bg-gray-100 text-gray-800",
    };
    return <Badge className={statusInfo.color}>{statusInfo.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-secondary mb-2">Vehicles</h1>
          <p className="text-gray-600">
            Manage vehicles in{" "}
            {localGovernment ? localGovernment.name : "your local government"}
          </p>
        </div>
        <Link href="/admin/vehicles/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Vehicle
          </Button>
        </Link>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by registration or driver..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                className="border rounded-md p-2 bg-white"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="available">Available</option>
                <option value="on_duty">On Duty</option>
                <option value="maintenance">Maintenance</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Vehicle
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
                Driver
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Capacity
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
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
            {filteredVehicles.map((vehicle) => (
              <tr key={vehicle._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Truck className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {vehicle.registrationNumber}
                      </div>
                      <div className="text-xs text-gray-500">
                        {vehicle.name || "No name"}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 capitalize">
                    {vehicle.type}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {vehicle.driver
                      ? `${vehicle.driver.firstName} ${vehicle.driver.lastName}`
                      : "Unassigned"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {vehicle.capacity} kg
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(vehicle.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/vehicles/${vehicle._id}/edit`}>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteVehicle(vehicle._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredVehicles.length === 0 && (
          <div className="text-center py-10">
            <Truck className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No vehicles found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding a new vehicle.
            </p>
            <div className="mt-6">
              <Link href="/admin/vehicles/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add Vehicle
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
