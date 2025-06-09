"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select as UiSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function DriverHistoryPage() {
  const { data: session } = useSession();
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("completed");

  useEffect(() => {
    const fetchPickups = async () => {
      setLoading(true);
      try {
        let url = `/api/pickups?assignedDriver=${session?.session?.user?.id}`;
        if (statusFilter) url += `&status=${statusFilter}`;
        const response = await axios.get(url);
        setPickups(response.data.data);
      } catch (error) {
        setPickups([]);
      } finally {
        setLoading(false);
      }
    };
    if (session?.session?.user?.id) fetchPickups();
  }, [session, statusFilter]);

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
          <h1 className="text-2xl font-bold text-secondary mb-2">
            Pickup History
          </h1>
          <p className="text-gray-600">Your completed and cancelled pickups</p>
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
                </div>
                <div className="flex flex-col gap-2 min-w-[120px]">
                  <Link href={`/driver/pickups/${pickup._id}`}>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
