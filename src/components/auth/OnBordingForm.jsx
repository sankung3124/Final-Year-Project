"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import axios from "axios";
import { MapPin, ArrowRight, Check } from "lucide-react";
import { onboardingSchema } from "@/lib/schema/auth";
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
import { useToast } from "@/components/ui/use-toast";
export default function OnboardingForm() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [locationResults, setLocationResults] = useState([]);
  const [searchLocation, setSearchLocation] = useState("");
  const [debouncedLocation, setDebouncedLocation] = useState("");
  const form = useForm({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      address: "",
      city: "",
      coordinates: { lat: 0, lng: 0 },
    },
  });

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedLocation(searchLocation);
    }, 500);

    return () => clearTimeout(timerId);
  }, [searchLocation]);
  useEffect(() => {
    if (debouncedLocation.length > 3) {
      fetchLocationSuggestions(debouncedLocation);
    }
  }, [debouncedLocation]);
  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/signin");
      return;
    }

    if (session.user?.onboardingCompleted) {
      router.push("/dashboard");
    }
  }, [session, status, router]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          form.setValue("coordinates", {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          reverseGeocode(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, [form]);
  const fetchLocationSuggestions = async (query) => {
    try {
      const response = await axios.get(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
          query
        )}&format=json&apiKey=YOUR_GEOAPIFY_API_KEY`
      );
      const suggestions = response.data.results.map((result) => ({
        value: result.place_id,
        label: result.formatted,
        address: result.formatted,
        city: result.city || result.county || "",
        coordinates: {
          lat: result.lat,
          lng: result.lon,
        },
      }));

      setLocationResults(suggestions);
    } catch (error) {
      console.error("Error fetching location suggestions:", error);
    }
  };
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await axios.get(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&format=json&apiKey=YOUR_GEOAPIFY_API_KEY`
      );

      if (response.data.results && response.data.results.length > 0) {
        const result = response.data.results[0];
        form.setValue("address", result.formatted);
        form.setValue("city", result.city || result.county || "");
      }
    } catch (error) {
      console.error("Error with reverse geocoding:", error);
    }
  };
  const handleLocationSelect = (locationId) => {
    const selectedLocation = locationResults.find(
      (loc) => loc.value === locationId
    );

    if (selectedLocation) {
      form.setValue("address", selectedLocation.address);
      form.setValue("city", selectedLocation.city);
      form.setValue("coordinates", selectedLocation.coordinates);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const response = await axios.post("/api/auth/onboarding", data);

      if (response.data.success) {
        setSuccess(true);
        toast({
          title: "Onboarding complete!",
          description: "Your profile has been updated successfully.",
          variant: "success",
        });
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      }
    } catch (error) {
      console.error("Onboarding error:", error);

      toast({
        title: "Onboarding failed",
        description:
          error.response?.data?.message ||
          "An error occurred during onboarding.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex flex-col items-center space-y-4">
          <svg
            className="animate-spin h-8 w-8 text-primary"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {success && (
        <div className="mb-6 p-3 bg-green-50 border border-green-200 text-green-600 text-sm rounded-md flex items-center">
          <Check className="h-5 w-5 mr-2" />
          Onboarding completed! Redirecting to dashboard...
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Street Address</FormLabel>
                <FormControl>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      placeholder="Search for your address"
                      className="pl-10"
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                      {...field}
                    />
                  </div>
                </FormControl>
                {locationResults.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    {locationResults.map((location) => (
                      <div
                        key={location.value}
                        className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                        onClick={() => {
                          handleLocationSelect(location.value);
                          setLocationResults([]);
                          setSearchLocation(location.address);
                        }}
                      >
                        <div className="font-medium">{location.label}</div>
                      </div>
                    ))}
                  </div>
                )}
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
                  <Input placeholder="Your city" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="p-3 bg-gray-50 text-sm text-gray-600 rounded-md">
            <p className="flex items-start">
              <svg
                className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              Your location helps us connect you with local recycling centers
              and pickup services. We take your privacy seriously and only use
              this information to enhance your experience.
            </p>
          </div>

          <Button type="submit" className="w-full h-11" disabled={loading}>
            {loading ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Submitting...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                Complete Setup
                <ArrowRight className="ml-2 h-4 w-4" />
              </div>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
