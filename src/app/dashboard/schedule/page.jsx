"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import {
  Truck,
  CalendarDays,
  Clock,
  MapPin,
  Info,
  Scale,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

const pickupSchema = z.object({
  pickupType: z.enum(["regular", "bulky", "recycling", "hazardous", "other"], {
    required_error: "Please select a pickup type",
  }),
  wasteDescription: z
    .string()
    .min(5, { message: "Description must be at least 5 characters" })
    .max(200, { message: "Description must be less than 200 characters" }),
  estimatedWeight: z.coerce
    .number()
    .min(0, { message: "Weight must be a positive number" })
    .optional(),
  address: z
    .string()
    .min(5, { message: "Address must be at least 5 characters" }),
  city: z.string().min(2, { message: "City is required" }),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  scheduledDate: z.string().min(1, { message: "Date is required" }),
  preferredTimeSlot: z.enum(["morning", "afternoon", "evening"], {
    required_error: "Please select a time slot",
  }),
  notes: z.string().optional(),
  localGovernment: z
    .string()
    .min(1, { message: "Please select a local government" }),
});

export default function SchedulePickup() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [localGovernments, setLocalGovernments] = useState([]);
  const [localGovSearch, setLocalGovSearch] = useState("");
  const [filteredLocalGovernments, setFilteredLocalGovernments] = useState([]);

  const form = useForm({
    resolver: zodResolver(pickupSchema),
    defaultValues: {
      pickupType: "regular",
      wasteDescription: "",
      estimatedWeight: 0,
      address: "",
      city: "",
      coordinates: { lat: 0, lng: 0 },
      scheduledDate: format(new Date(), "yyyy-MM-dd"),
      preferredTimeSlot: "morning",
      notes: "",
      localGovernment: "",
    },
  });

  useEffect(() => {
    if (editId) {
      setIsEditing(true);
      fetchPickupDetails(editId);
    } else {
      fetchUserLocation();
    }
    // Fetch local governments
    const fetchLocalGovernments = async () => {
      try {
        const response = await axios.get("/api/local-governments");
        if (response.data.success) {
          setLocalGovernments(response.data.data);
          setFilteredLocalGovernments(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching local governments:", error);
      }
    };
    fetchLocalGovernments();
  }, [editId]);

  useEffect(() => {
    if (localGovSearch.length === 0) {
      setFilteredLocalGovernments(localGovernments);
    } else {
      setFilteredLocalGovernments(
        localGovernments.filter(
          (lg) =>
            lg.name.toLowerCase().includes(localGovSearch.toLowerCase()) ||
            lg.region.toLowerCase().includes(localGovSearch.toLowerCase())
        )
      );
    }
  }, [localGovSearch, localGovernments]);

  const fetchPickupDetails = async (id) => {
    try {
      const response = await axios.get(`/api/pickups/${id}`);
      const pickup = response.data.data;

      form.reset({
        pickupType: pickup.pickupType,
        wasteDescription: pickup.wasteDescription,
        estimatedWeight: pickup.estimatedWeight || 0,
        address: pickup.location.address,
        city: pickup.location.city,
        coordinates: pickup.location.coordinates,
        scheduledDate: format(new Date(pickup.scheduledDate), "yyyy-MM-dd"),
        preferredTimeSlot: pickup.preferredTimeSlot,
        notes: pickup.notes || "",
        localGovernment: pickup.localGovernment || "",
      });
    } catch (error) {
      console.error("Error fetching pickup details:", error);
      toast({
        title: "Error",
        description: "Failed to load pickup details. Please try again.",
        variant: "destructive",
      });
    }
  };

  const fetchUserLocation = async () => {
    try {
      const { data: session } = await axios.get("/api/auth/session");

      if (session?.user?.location) {
        form.setValue("address", session.user.location.address);
        form.setValue("city", session.user.location.city);
        form.setValue("coordinates", session.user.location.coordinates);
      }
    } catch (error) {
      console.error("Error fetching user location:", error);
    }
  };

  const getCurrentLocation = () => {
    setLoadingLocation(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coordinates = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          form.setValue("coordinates", coordinates);

          // Reverse geocode to get address and city
          try {
            const response = await axios.get(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coordinates.lat}&lon=${coordinates.lng}&addressdetails=1`,
              {
                headers: {
                  "User-Agent": "EcoGambia Waste Management",
                },
              }
            );

            if (response.data) {
              const address = response.data.display_name;
              const city =
                response.data.address.city ||
                response.data.address.town ||
                response.data.address.village ||
                response.data.address.county ||
                "Banjul";

              form.setValue("address", address);
              form.setValue("city", city);
            }
          } catch (error) {
            console.error("Error with reverse geocoding:", error);
          }

          setLoadingLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({
            title: "Location Error",
            description:
              "Unable to get your current location. Please enter it manually.",
            variant: "destructive",
          });
          setLoadingLocation(false);
        },
        { enableHighAccuracy: true }
      );
    } else {
      toast({
        title: "Location Not Supported",
        description:
          "Geolocation is not supported by your browser. Please enter your location manually.",
        variant: "destructive",
      });
      setLoadingLocation(false);
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      const pickupData = {
        pickupType: data.pickupType,
        wasteDescription: data.wasteDescription,
        estimatedWeight: data.estimatedWeight || 0,
        location: {
          address: data.address,
          city: data.city,
          coordinates: data.coordinates,
        },
        scheduledDate: new Date(data.scheduledDate).toISOString(),
        preferredTimeSlot: data.preferredTimeSlot,
        notes: data.notes || "",
        localGovernment: data.localGovernment,
      };

      if (isEditing) {
        await axios.put(`/api/pickups/${editId}`, pickupData);
        toast({
          title: "Pickup Updated",
          description: "Your pickup has been successfully updated.",
          variant: "success",
        });
      } else {
        await axios.post("/api/pickups", pickupData);
        toast({
          title: "Pickup Scheduled",
          description: "Your pickup has been successfully scheduled.",
          variant: "success",
        });
      }

      setIsSuccess(true);

      setTimeout(() => {
        router.push("/dashboard/pickups");
      }, 2000);
    } catch (error) {
      console.error("Error scheduling pickup:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          "Failed to schedule pickup. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-lg">
          <CardContent className="flex flex-col items-center justify-center p-10">
            <div className="bg-green-100 rounded-full p-3 mb-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-secondary mb-2">
              {isEditing ? "Pickup Updated!" : "Pickup Scheduled!"}
            </h2>
            <p className="text-gray-600 text-center mb-6">
              {isEditing
                ? "Your pickup has been successfully updated. We'll notify you of any changes."
                : "Your pickup has been successfully scheduled. We'll notify you when it's assigned to a driver."}
            </p>
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard")}
              >
                Go to Dashboard
              </Button>
              <Button onClick={() => router.push("/dashboard/pickups")}>
                View My Pickups
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-secondary mb-2">
          {isEditing ? "Update Pickup" : "Schedule a Pickup"}
        </h1>
        <p className="text-gray-600">
          {isEditing
            ? "Update your pickup details below."
            : "Fill in the details below to schedule a waste pickup."}
        </p>
      </div>

      <Card className="shadow-lg overflow-hidden">
        <CardHeader className="bg-primary/5 border-b border-primary/10">
          <CardTitle className="flex items-center text-secondary">
            <Truck className="mr-2 h-5 w-5 text-primary" />
            {isEditing ? "Update Pickup Request" : "New Pickup Request"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="pickupType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Waste Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select waste type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="regular">Regular Waste</SelectItem>
                          <SelectItem value="bulky">Bulky Items</SelectItem>
                          <SelectItem value="recycling">Recyclables</SelectItem>
                          <SelectItem value="hazardous">
                            Hazardous Waste
                          </SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="estimatedWeight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Weight (kg)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Scale className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <Input
                            type="number"
                            placeholder="Enter estimated weight"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="wasteDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Waste Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the waste to be collected"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="bg-blue-50 p-4 rounded-md flex items-start">
                <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-sm text-blue-700">
                  Please provide accurate details about your waste. This helps
                  us send the appropriate vehicle and equipment for efficient
                  collection.
                </p>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-secondary mb-4">
                  Pickup Location
                </h3>

                <div className="flex justify-end mb-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={getCurrentLocation}
                    disabled={loadingLocation}
                  >
                    {loadingLocation ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Getting location...
                      </>
                    ) : (
                      <>
                        <MapPin className="mr-2 h-4 w-4" />
                        Use current location
                      </>
                    )}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <Input
                              placeholder="Enter your address"
                              className="pl-10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your city" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-secondary mb-4">
                  Pickup Schedule
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="scheduledDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <Input type="date" className="pl-10" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="preferredTimeSlot"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Time</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="pl-10">
                              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                              <SelectValue placeholder="Select time slot" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="morning">
                              Morning (8am - 12pm)
                            </SelectItem>
                            <SelectItem value="afternoon">
                              Afternoon (12pm - 4pm)
                            </SelectItem>
                            <SelectItem value="evening">
                              Evening (4pm - 8pm)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any special instructions or important information for the pickup"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-secondary mb-4">
                  Select Local Government
                </h3>
                <FormField
                  control={form.control}
                  name="localGovernment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Local Government</FormLabel>
                      <FormControl>
                        <div>
                          <Input
                            placeholder="Search local government by name or region"
                            value={localGovSearch}
                            onChange={(e) => setLocalGovSearch(e.target.value)}
                            className="mb-2"
                          />
                          <select
                            className="w-full border rounded-md p-2"
                            value={field.value}
                            onChange={field.onChange}
                          >
                            <option value="">Select a local government</option>
                            {filteredLocalGovernments.map((lg) => (
                              <option key={lg._id} value={lg._id}>
                                {lg.name} ({lg.region})
                              </option>
                            ))}
                          </select>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isEditing ? "Updating..." : "Scheduling..."}
                    </>
                  ) : (
                    <>{isEditing ? "Update Pickup" : "Schedule Pickup"}</>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
