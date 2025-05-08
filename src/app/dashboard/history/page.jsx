"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import {
  Calendar,
  Search,
  Filter,
  FileText,
  Download,
  Loader2,
  ArrowUpDown,
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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function PickupHistory() {
  const { toast } = useToast();
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("scheduledDate");
  const [sortDirection, setSortDirection] = useState("desc");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchPickupHistory();
  }, [statusFilter, dateFilter, page, sortField, sortDirection]);

  const fetchPickupHistory = async () => {
    setLoading(true);
    try {
      let url = "/api/pickups";
      const queryParams = [];

      if (statusFilter !== "all") {
        queryParams.push(`status=${statusFilter}`);
      }

      // Add date filter based on selection
      if (dateFilter !== "all") {
        const today = new Date();
        const dateFrom = new Date();

        if (dateFilter === "last7days") {
          dateFrom.setDate(today.getDate() - 7);
        } else if (dateFilter === "last30days") {
          dateFrom.setDate(today.getDate() - 30);
        } else if (dateFilter === "last3months") {
          dateFrom.setMonth(today.getMonth() - 3);
        } else if (dateFilter === "last6months") {
          dateFrom.setMonth(today.getMonth() - 6);
        } else if (dateFilter === "lastyear") {
          dateFrom.setFullYear(today.getFullYear() - 1);
        }

        queryParams.push(`dateFrom=${dateFrom.toISOString()}`);
      }

      if (queryParams.length > 0) {
        url += `?${queryParams.join("&")}`;
      }

      const response = await axios.get(url);
      setPickups(response.data.data);
      setTotalPages(Math.ceil(response.data.data.length / itemsPerPage));
    } catch (error) {
      console.error("Error fetching pickup history:", error);
      toast({
        title: "Error",
        description: "Failed to load pickup history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
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

  // Filter pickups based on search query
  const filteredPickups = pickups.filter((pickup) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      (pickup.wasteDescription &&
        pickup.wasteDescription.toLowerCase().includes(query)) ||
      (pickup.location.address &&
        pickup.location.address.toLowerCase().includes(query)) ||
      (pickup.location.city &&
        pickup.location.city.toLowerCase().includes(query)) ||
      (pickup.status && pickup.status.toLowerCase().includes(query)) ||
      (pickup._id && pickup._id.toLowerCase().includes(query))
    );
  });

  // Sort pickups based on selected field and direction
  const sortedPickups = [...filteredPickups].sort((a, b) => {
    if (sortField === "scheduledDate") {
      return sortDirection === "asc"
        ? new Date(a.scheduledDate) - new Date(b.scheduledDate)
        : new Date(b.scheduledDate) - new Date(a.scheduledDate);
    } else if (sortField === "status") {
      return sortDirection === "asc"
        ? a.status.localeCompare(b.status)
        : b.status.localeCompare(a.status);
    } else if (sortField === "type") {
      return sortDirection === "asc"
        ? a.pickupType.localeCompare(b.pickupType)
        : b.pickupType.localeCompare(a.pickupType);
    } else if (sortField === "weight") {
      const aWeight = a.actualWeight || a.estimatedWeight || 0;
      const bWeight = b.actualWeight || b.estimatedWeight || 0;
      return sortDirection === "asc" ? aWeight - bWeight : bWeight - aWeight;
    }
    return 0;
  });

  // Get current page items
  const currentItems = sortedPickups.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const exportCsv = () => {
    // Create CSV header
    const headers = [
      "ID",
      "Date",
      "Type",
      "Status",
      "Weight (kg)",
      "Location",
      "City",
    ];

    // Create CSV rows
    const csvRows = [headers.join(",")];

    filteredPickups.forEach((pickup) => {
      const row = [
        pickup._id,
        new Date(pickup.scheduledDate).toLocaleDateString(),
        pickup.pickupType,
        pickup.status,
        pickup.actualWeight || pickup.estimatedWeight || "",
        `"${pickup.location.address.replace(/"/g, '""')}"`,
        pickup.location.city,
      ];

      csvRows.push(row.join(","));
    });

    // Create and download the CSV file
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "pickup_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-secondary mb-2">
              Pickup History
            </h1>
            <p className="text-gray-600">
              View and manage your past waste collection records
            </p>
          </div>
          <Button
            className="mt-4 sm:mt-0"
            variant="outline"
            onClick={exportCsv}
            disabled={filteredPickups.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Export as CSV
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative col-span-1 sm:col-span-3 md:col-span-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search by description, location..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center">
            <Filter className="mr-2 h-4 w-4 text-gray-500" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="requested">Requested</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center">
            <Calendar className="mr-2 h-4 w-4 text-gray-500" />
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="last7days">Last 7 Days</SelectItem>
                <SelectItem value="last30days">Last 30 Days</SelectItem>
                <SelectItem value="last3months">Last 3 Months</SelectItem>
                <SelectItem value="last6months">Last 6 Months</SelectItem>
                <SelectItem value="lastyear">Last Year</SelectItem>
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
        <>
          {currentItems.length > 0 ? (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("scheduledDate")}
                      >
                        <div className="flex items-center">
                          Date
                          <ArrowUpDown className="ml-1 h-4 w-4" />
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("type")}
                      >
                        <div className="flex items-center">
                          Type
                          <ArrowUpDown className="ml-1 h-4 w-4" />
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("status")}
                      >
                        <div className="flex items-center">
                          Status
                          <ArrowUpDown className="ml-1 h-4 w-4" />
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("weight")}
                      >
                        <div className="flex items-center">
                          Weight
                          <ArrowUpDown className="ml-1 h-4 w-4" />
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Location
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
                    {currentItems.map((pickup) => (
                      <tr key={pickup._id} className="hover:bg-gray-50">
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
                          <Badge className={getStatusColor(pickup.status)}>
                            {pickup.status.charAt(0).toUpperCase() +
                              pickup.status.slice(1).replace("_", " ")}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {pickup.actualWeight
                            ? `${pickup.actualWeight} kg`
                            : pickup.estimatedWeight
                            ? `Est. ${pickup.estimatedWeight} kg`
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                          <div className="truncate">
                            {pickup.location.address}
                          </div>
                          <div className="text-xs">{pickup.location.city}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link href={`/dashboard/pickups/${pickup._id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-primary"
                            >
                              <FileText className="mr-1 h-4 w-4" />
                              Details
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="py-4 bg-white border-t border-gray-200">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (page > 1) setPage(page - 1);
                          }}
                          className={
                            page <= 1 ? "pointer-events-none opacity-50" : ""
                          }
                        />
                      </PaginationItem>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (pageNum) => (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setPage(pageNum);
                              }}
                              isActive={pageNum === page}
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      )}

                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (page < totalPages) setPage(page + 1);
                          }}
                          className={
                            page >= totalPages
                              ? "pointer-events-none opacity-50"
                              : ""
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No pickup history found
              </h3>
              <p className="text-gray-500 mb-6">
                {searchQuery || statusFilter !== "all" || dateFilter !== "all"
                  ? "Try adjusting your search or filters to find what you're looking for."
                  : "You haven't scheduled any waste pickups yet."}
              </p>
              {searchQuery || statusFilter !== "all" || dateFilter !== "all" ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setDateFilter("all");
                  }}
                >
                  Clear Filters
                </Button>
              ) : (
                <Link href="/dashboard/schedule">
                  <Button>Schedule Your First Pickup</Button>
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
