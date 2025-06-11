"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Select as UiSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function AdminPickupsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [pickups, setPickups] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [assigning, setAssigning] = useState({});
  const [selectedDriver, setSelectedDriver] = useState({});
  const [localGovernment, setLocalGovernment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const lgResponse = await axios.get(
          `/api/users/${session?.session.user.id}/local-government`
        );
        if (lgResponse.data.success) {
          setLocalGovernment(lgResponse.data.data);
        }
        // Fetch pickups for this local government
        let url = `/api/pickups?localGovernment=${lgResponse.data.data._id}`;
        if (statusFilter && statusFilter !== "all")
          url += `&status=${statusFilter}`;
        const pickupsResponse = await axios.get(url);
        setPickups(pickupsResponse.data.data);
        // Fetch drivers for this local government
        const driversResponse = await axios.get(
          `/api/admin/users?localGovernment=${lgResponse.data.data._id}&role=driver`
        );
        setDrivers(driversResponse.data.data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load pickups",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    if (session?.session?.user?.id) {
      fetchData();
    }
  }, [session, statusFilter]);

  const handleAssignDriver = async (pickupId) => {
    if (!selectedDriver[pickupId]) return;
    setAssigning((prev) => ({ ...prev, [pickupId]: true }));
    try {
      await axios.put(`/api/pickups/${pickupId}`, {
        assignedDriver: selectedDriver[pickupId],
        status: "assigned",
      });
      toast({
        title: "Driver Assigned",
        description: "Pickup has been assigned to the driver.",
        variant: "success",
      });
      // Refresh pickups
      let url = `/api/pickups?localGovernment=${localGovernment._id}`;
      if (statusFilter && statusFilter !== "all")
        url += `&status=${statusFilter}`;
      const pickupsResponse = await axios.get(url);
      setPickups(pickupsResponse.data.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign driver.",
        variant: "destructive",
      });
    } finally {
      setAssigning((prev) => ({ ...prev, [pickupId]: false }));
    }
  };

  const filteredPickups = pickups.filter((pickup) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      pickup.wasteDescription?.toLowerCase().includes(q) ||
      pickup.location?.address?.toLowerCase().includes(q) ||
      pickup.status?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary mb-2">Pickups</h1>
          <p className="text-gray-600">
            All pickups for{" "}
            {localGovernment ? localGovernment.name : "your local government"}
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <Input
            placeholder="Search pickups..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
          <UiSelect value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="requested">Requested</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </UiSelect>
        </div>
      </div>
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredPickups.length === 0 ? (
          <div className="text-gray-500">No pickups found.</div>
        ) : (
          filteredPickups.map((pickup) => (
            <Card key={pickup._id} className="border-l-4 border-primary">
              <CardContent className="p-4 flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="font-semibold text-secondary mb-1">
                    {pickup.wasteDescription}
                  </div>
                  <div className="text-xs text-gray-500 mb-1">
                    {new Date(pickup.scheduledDate).toLocaleString()} |{" "}
                    {pickup.status}
                  </div>
                  <div className="text-xs text-gray-500 mb-1">
                    Address: {pickup.location?.address}
                  </div>
                  <div className="text-xs text-gray-500 mb-1">
                    User: {pickup.user?.firstName} {pickup.user?.lastName}
                  </div>
                </div>
                <div className="flex flex-col gap-2 min-w-[220px]">
                  <UiSelect
                    value={selectedDriver[pickup._id] || ""}
                    onValueChange={(val) =>
                      setSelectedDriver((prev) => ({
                        ...prev,
                        [pickup._id]: val,
                      }))
                    }
                    disabled={assigning[pickup._id]}
                  >
                    <SelectTrigger className="mb-2">
                      <SelectValue placeholder="Assign to driver" />
                    </SelectTrigger>
                    <SelectContent>
                      {drivers.length === 0 ? (
                        <SelectItem value="no_drivers" disabled>
                          No drivers available
                        </SelectItem>
                      ) : (
                        drivers.map((driver) => (
                          <SelectItem key={driver._id} value={driver._id}>
                            {driver.firstName} {driver.lastName}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </UiSelect>
                  <Button
                    size="sm"
                    disabled={
                      !selectedDriver[pickup._id] || assigning[pickup._id]
                    }
                    onClick={() => handleAssignDriver(pickup._id)}
                  >
                    {assigning[pickup._id]
                      ? "Assigning..."
                      : pickup.assignedDriver
                      ? "Reassign Driver"
                      : "Assign Driver"}
                  </Button>
                  {pickup.assignedDriver && (
                    <div className="text-green-600 text-sm font-medium">
                      Assigned to {pickup.assignedDriver.firstName}{" "}
                      {pickup.assignedDriver.lastName}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
