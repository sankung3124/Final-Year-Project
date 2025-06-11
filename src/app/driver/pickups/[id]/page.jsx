"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

export default function DriverPickupDetails({ params }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pickup, setPickup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    fetchPickupDetails();
  }, [params.id]);

  const fetchPickupDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/pickups/${params.id}`);
      setPickup(response.data.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load pickup details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    setStatusUpdating(true);
    try {
      await axios.put(`/api/pickups/${params.id}`, { status: newStatus });
      toast({
        title: "Status Updated",
        description: `Pickup marked as ${newStatus}`,
        variant: "success",
      });
      fetchPickupDetails();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setStatusUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!pickup) {
    return <div className="text-center text-gray-500">Pickup not found.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Pickup Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <strong>Status:</strong> {pickup.status}
          </div>
          <div>
            <strong>Scheduled Date:</strong>{" "}
            {new Date(pickup.scheduledDate).toLocaleString()}
          </div>
          <div>
            <strong>Address:</strong> {pickup.location?.address}
          </div>
          <div>
            <strong>Waste Description:</strong> {pickup.wasteDescription}
          </div>
          <div>
            <strong>Preferred Time:</strong> {pickup.preferredTimeSlot}
          </div>
          <div>
            <strong>Notes:</strong> {pickup.notes || "-"}
          </div>
        </CardContent>
        <CardFooter className="flex gap-4 justify-end">
          <Link href="/driver/pickups">
            <Button variant="outline">Back to Pickups</Button>
          </Link>
          {pickup.status === "assigned" && (
            <Button
              onClick={() => updateStatus("in_progress")}
              disabled={statusUpdating}
            >
              {statusUpdating ? "Updating..." : "Start Pickup"}
            </Button>
          )}
          {pickup.status === "in_progress" && (
            <Button
              onClick={() => updateStatus("completed")}
              disabled={statusUpdating}
            >
              {statusUpdating ? "Updating..." : "Mark as Completed"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
