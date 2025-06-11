import mongoose from "mongoose";

const PickupSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      default: null,
    },
    pickupType: {
      type: String,
      enum: ["regular", "bulky", "recycling", "hazardous", "other"],
      default: "regular",
    },
    wasteDescription: {
      type: String,
      required: [true, "Waste description is required"],
    },
    estimatedWeight: {
      type: Number, // weight in kilograms
      default: 0,
    },
    location: {
      address: {
        type: String,
        required: [true, "Address is required"],
      },
      city: {
        type: String,
        required: [true, "City is required"],
      },
      coordinates: {
        lat: {
          type: Number,
          required: [true, "Latitude is required"],
        },
        lng: {
          type: Number,
          required: [true, "Longitude is required"],
        },
      },
    },
    scheduledDate: {
      type: Date,
      required: [true, "Scheduled date is required"],
    },
    preferredTimeSlot: {
      type: String,
      enum: ["morning", "afternoon", "evening"],
      default: "morning",
    },
    status: {
      type: String,
      enum: [
        "requested",
        "scheduled",
        "assigned",
        "in_progress",
        "completed",
        "cancelled",
      ],
      default: "requested",
    },
    notes: {
      type: String,
      default: "",
    },
    completedAt: {
      type: Date,
      default: null,
    },
    actualWeight: {
      type: Number, // weight in kilograms
      default: null,
    },
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
        default: null,
      },
      comment: {
        type: String,
        default: "",
      },
      createdAt: {
        type: Date,
        default: null,
      },
    },
    localGovernment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LocalGovernment",
      required: true,
    },
    assignedDriver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Pickup || mongoose.model("Pickup", PickupSchema);
