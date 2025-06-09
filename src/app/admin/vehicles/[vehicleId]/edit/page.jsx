"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Truck } from "lucide-react";
import Link from "next/link";

export default function EditVehiclePage() {
  const { vehicleId } = useParams();
  const { data: session } = useSession();
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [drivers, setDrivers] = useState([]);
  const [formData, setFormData] = useState({
    registrationNumber: "",
    name: "",
    type: "truck",
    capacity: "",
    driver: "",
    status: "available",
    lastMaintenance: "",
    nextMaintenance: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch drivers
        const driversResponse = await axios.get("/api/admin/drivers");
        if (driversResponse.data.success) {
          setDrivers(driversResponse.data.data);
        }

        // Fetch vehicle data
        const vehicleResponse = await axios.get(`/api/vehicles/${vehicleId}`);
        if (vehicleResponse.data.success) {
          const vehicle = vehicleResponse.data.data;
          setFormData({
            registrationNumber: vehicle.registrationNumber,
            name: vehicle.name || "",
            type: vehicle.type,
            capacity: vehicle.capacity,
            driver: vehicle.driver?._id || "",
            status: vehicle.status,
            lastMaintenance: vehicle.lastMaintenance
              ? new Date(vehicle.lastMaintenance).toISOString().split("T")[0]
              : "",
            nextMaintenance: vehicle.nextMaintenance
              ? new Date(vehicle.nextMaintenance).toISOString().split("T")[0]
              : "",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load vehicle data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [vehicleId, toast]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.put(`/api/vehicles/${vehicleId}`, formData);

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Vehicle updated successfully",
        });
        router.push("/admin/vehicles");
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update vehicle",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
      <div className="flex items-center mb-6">
        <Link href="/admin/vehicles">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="ml-4">
          <h1 className="text-2xl font-bold text-secondary">Edit Vehicle</h1>
          <p className="text-gray-600">
            Update vehicle details and assignments
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Truck className="w-5 h-5 mr-2 text-primary" />
            Vehicle Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="registrationNumber">
                  Registration Number *
                </Label>
                <Input
                  id="registrationNumber"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  placeholder="e.g. BJL 1234"
                />
              </div>

              <div>
                <Label htmlFor="name">Vehicle Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="e.g. Waste Collection Truck #1"
                />
              </div>

              <div>
                <Label htmlFor="type">Vehicle Type *</Label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="border rounded-md p-2 w-full bg-white"
                  required
                  disabled={loading}
                >
                  <option value="truck">Truck</option>
                  <option value="van">Van</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <Label htmlFor="capacity">Capacity (kg) *</Label>
                <Input
                  id="capacity"
                  name="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  placeholder="e.g. 5000"
                  min="1"
                />
              </div>

              <div>
                <Label htmlFor="driver">Assigned Driver</Label>
                <select
                  id="driver"
                  name="driver"
                  value={formData.driver}
                  onChange={handleChange}
                  className="border rounded-md p-2 w-full bg-white"
                  disabled={loading}
                >
                  <option value="">Unassigned</option>
                  {drivers.map((driver) => (
                    <option key={driver._id} value={driver._id}>
                      {driver.firstName} {driver.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="status">Status *</Label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="border rounded-md p-2 w-full bg-white"
                  required
                  disabled={loading}
                >
                  <option value="available">Available</option>
                  <option value="on_duty">On Duty</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <Label htmlFor="lastMaintenance">Last Maintenance Date</Label>
                <Input
                  id="lastMaintenance"
                  name="lastMaintenance"
                  type="date"
                  value={formData.lastMaintenance}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="nextMaintenance">Next Maintenance Due</Label>
                <Input
                  id="nextMaintenance"
                  name="nextMaintenance"
                  type="date"
                  value={formData.nextMaintenance}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Link href="/admin/vehicles">
                <Button variant="outline" disabled={loading}>
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Vehicle"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
