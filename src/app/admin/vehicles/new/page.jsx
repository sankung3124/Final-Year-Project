"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Truck } from "lucide-react";
import Link from "next/link";

export default function CreateVehiclePage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
    const fetchDrivers = async () => {
      try {
        const response = await axios.get("/api/admin/drivers");
        if (response.data.success) {
          setDrivers(response.data.data);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load drivers",
          variant: "destructive",
        });
      }
    };

    fetchDrivers();
  }, [toast]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("/api/vehicles", formData);

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Vehicle created successfully",
        });
        router.push("/admin/vehicles");
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to create vehicle",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <Link href="/admin/vehicles">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="ml-4">
          <h1 className="text-2xl font-bold text-secondary">Add New Vehicle</h1>
          <p className="text-gray-600">
            Register a new vehicle for waste collection
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

            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Vehicle"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
