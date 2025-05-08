"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import {
  Truck,
  MapPin,
  Calendar,
  Clock,
  User,
  FileText,
  Scale,
  CheckCircle,
  XCircle,
  Loader2,
  Edit,
  ChevronLeft,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function PickupDetails({ params }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pickup, setPickup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedback, setFeedback] = useState({
    rating: 5,
    comment: "",
  });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  useEffect(() => {
    fetchPickupDetails();
  }, [params.id]);

  const fetchPickupDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/pickups/${params.id}`);
      setPickup(response.data.data);

      if (response.data.data.feedback?.rating) {
        setFeedback({
          rating: response.data.data.feedback.rating,
          comment: response.data.data.feedback.comment || "",
        });
      }
    } catch (error) {
      console.error("Error fetching pickup details:", error);
      setError(true);
      toast({
        title: "Error",
        description: "Failed to load pickup details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelPickup = async () => {
    if (!confirm("Are you sure you want to cancel this pickup?")) {
      return;
    }

    try {
      await axios.put(`/api/pickups/${params.id}`, { status: "cancelled" });
      toast({
        title: "Pickup Cancelled",
        description: "Your pickup has been successfully cancelled",
        variant: "success",
      });
      fetchPickupDetails();
    } catch (error) {
      console.error("Error cancelling pickup:", error);
      toast({
        title: "Error",
        description: "Failed to cancel pickup",
        variant: "destructive",
      });
    }
  };

  const handleFeedbackSubmit = async () => {
    setSubmittingFeedback(true);
    try {
      await axios.put(`/api/pickups/${params.id}`, {
        feedback: {
          rating: feedback.rating,
          comment: feedback.comment,
          createdAt: new Date(),
        },
      });

      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback!",
        variant: "success",
      });

      setShowFeedbackForm(false);
      fetchPickupDetails();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Error",
        description: "Failed to submit feedback",
        variant: "destructive",
      });
    } finally {
      setSubmittingFeedback(false);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !pickup) {
    return (
      <div className="text-center py-12">
        <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-secondary mb-2">
          Pickup Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          The pickup you're looking for doesn't exist or you don't have
          permission to view it.
        </p>
        <Button onClick={() => router.push("/dashboard/pickups")}>
          Back to My Pickups
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          className="mb-2"
          onClick={() => router.back()}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back
        </Button>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-secondary">Pickup Details</h1>
          <Badge
            className={`${getStatusColor(
              pickup.status
            )} text-sm px-3 py-1 mt-2 sm:mt-0`}
          >
            {pickup.status.charAt(0).toUpperCase() +
              pickup.status.slice(1).replace("_", " ")}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-secondary">
                <Truck className="mr-2 h-5 w-5 text-primary" />
                Pickup Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Waste Type
                  </h3>
                  <p className="text-secondary capitalize">
                    {pickup.pickupType}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    {pickup.status === "completed"
                      ? "Actual Weight"
                      : "Estimated Weight"}
                  </h3>
                  <p className="text-secondary">
                    {pickup.status === "completed" && pickup.actualWeight
                      ? `${pickup.actualWeight} kg`
                      : pickup.estimatedWeight
                      ? `${pickup.estimatedWeight} kg`
                      : "Not specified"}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Description
                </h3>
                <p className="text-secondary whitespace-pre-line">
                  {pickup.wasteDescription}
                </p>
              </div>

              {pickup.notes && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Additional Notes
                  </h3>
                  <p className="text-secondary whitespace-pre-line">
                    {pickup.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-secondary">
                <MapPin className="mr-2 h-5 w-5 text-primary" />
                Pickup Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Address</h3>
                <p className="text-secondary">{pickup.location.address}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">City</h3>
                  <p className="text-secondary">{pickup.location.city}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Coordinates
                  </h3>
                  <p className="text-secondary">
                    {pickup.location.coordinates.lat.toFixed(6)},{" "}
                    {pickup.location.coordinates.lng.toFixed(6)}
                  </p>
                </div>
              </div>

              <div className="mt-4 h-48 bg-gray-100 rounded-md flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    Map location view here
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {pickup.status === "completed" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-secondary">
                  <Star className="mr-2 h-5 w-5 text-yellow-500" />
                  Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pickup.feedback && pickup.feedback.rating ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">
                        Your Rating
                      </h3>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-5 w-5 ${
                              star <= pickup.feedback.rating
                                ? "text-yellow-500 fill-yellow-500"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {pickup.feedback.comment && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">
                          Your Comment
                        </h3>
                        <p className="text-secondary whitespace-pre-line">
                          {pickup.feedback.comment}
                        </p>
                      </div>
                    )}

                    <div className="text-sm text-gray-500">
                      Submitted on{" "}
                      {pickup.feedback.createdAt
                        ? new Date(
                            pickup.feedback.createdAt
                          ).toLocaleDateString()
                        : "N/A"}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowFeedbackForm(true)}
                    >
                      Update Feedback
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500 mb-4">
                      How was your waste collection experience?
                    </p>
                    <Button onClick={() => setShowFeedbackForm(true)}>
                      Leave Feedback
                    </Button>
                  </div>
                )}

                {showFeedbackForm && (
                  <div className="mt-6 border-t pt-6">
                    <h3 className="text-lg font-medium text-secondary mb-4">
                      {pickup.feedback && pickup.feedback.rating
                        ? "Update Your Feedback"
                        : "Rate Your Experience"}
                    </h3>

                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Rating
                        </h4>
                        <RadioGroup
                          value={feedback.rating.toString()}
                          onValueChange={(value) =>
                            setFeedback({
                              ...feedback,
                              rating: parseInt(value),
                            })
                          }
                          className="flex space-x-4"
                        >
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <div
                              key={rating}
                              className="flex flex-col items-center"
                            >
                              <RadioGroupItem
                                value={rating.toString()}
                                id={`rating-${rating}`}
                                className="sr-only"
                              />
                              <Label
                                htmlFor={`rating-${rating}`}
                                className="cursor-pointer flex flex-col items-center space-y-1"
                              >
                                <Star
                                  className={`h-8 w-8 ${
                                    rating <= feedback.rating
                                      ? "text-yellow-500 fill-yellow-500"
                                      : "text-gray-300"
                                  }`}
                                />
                                <span className="text-xs">{rating}</span>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>

                      <div>
                        <Label
                          htmlFor="comment"
                          className="text-sm font-medium text-gray-700"
                        >
                          Comments (Optional)
                        </Label>
                        <Textarea
                          id="comment"
                          placeholder="Share your experience with this pickup service..."
                          className="mt-1"
                          value={feedback.comment}
                          onChange={(e) =>
                            setFeedback({
                              ...feedback,
                              comment: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setShowFeedbackForm(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleFeedbackSubmit}
                          disabled={submittingFeedback}
                        >
                          {submittingFeedback ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            "Submit Feedback"
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-secondary">
                <Calendar className="mr-2 h-5 w-5 text-primary" />
                Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Date</h3>
                <p className="text-secondary">
                  {new Date(pickup.scheduledDate).toLocaleDateString(
                    undefined,
                    {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Time Slot</h3>
                <p className="text-secondary capitalize">
                  {pickup.preferredTimeSlot} (
                  {pickup.preferredTimeSlot === "morning"
                    ? "8am - 12pm"
                    : pickup.preferredTimeSlot === "afternoon"
                    ? "12pm - 4pm"
                    : "4pm - 8pm"}
                  )
                </p>
              </div>

              {pickup.status === "completed" && pickup.completedAt && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Completed On
                  </h3>
                  <p className="text-secondary">
                    {new Date(pickup.completedAt).toLocaleDateString(
                      undefined,
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {pickup.vehicle && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-secondary">
                  <Truck className="mr-2 h-5 w-5 text-primary" />
                  Vehicle Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Registration
                  </h3>
                  <p className="text-secondary">
                    {pickup.vehicle.registrationNumber}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Type</h3>
                  <p className="text-secondary capitalize">
                    {pickup.vehicle.type}
                  </p>
                </div>
                {pickup.vehicle.driver && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Driver
                    </h3>
                    <p className="text-secondary">
                      {pickup.vehicle.driver.firstName}{" "}
                      {pickup.vehicle.driver.lastName}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-secondary">
                <FileText className="mr-2 h-5 w-5 text-primary" />
                Other Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Request ID
                </h3>
                <p className="text-secondary">{pickup._id}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Created On
                </h3>
                <p className="text-secondary">
                  {new Date(pickup.createdAt).toLocaleDateString()}
                </p>
              </div>
              {pickup.updatedAt && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Last Updated
                  </h3>
                  <p className="text-secondary">
                    {new Date(pickup.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3">
            {["requested", "scheduled"].includes(pickup.status) && (
              <>
                <Link href={`/dashboard/schedule?edit=${pickup._id}`}>
                  <Button className="w-full" variant="outline">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Pickup
                  </Button>
                </Link>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={cancelPickup}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancel Pickup
                </Button>
              </>
            )}

            {pickup.status === "completed" && !pickup.feedback?.rating && (
              <Button
                className="w-full"
                onClick={() => setShowFeedbackForm(true)}
              >
                <Star className="mr-2 h-4 w-4" />
                Leave Feedback
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
