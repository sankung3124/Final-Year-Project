import mongoose from "mongoose";

const PickupRequestSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    location: {
      address: {
        type: String,
        required: [true, "Address is required"],
      },
      city: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    wasteType: {
      type: String,
      enum: [
        "general",
        "recyclable",
        "organic",
        "hazardous",
        "construction",
        "electronic",
      ],
      default: "general",
    },
    wasteSize: {
      type: String,
      enum: ["small", "medium", "large", "extra-large"],
      default: "medium",
    },
    estimatedWeight: {
      type: Number,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    preferredDate: {
      type: Date,
      required: [true, "Preferred date is required"],
    },
    preferredTimeSlot: {
      type: String,
      enum: ["morning", "afternoon", "evening"],
      required: [true, "Preferred time slot is required"],
    },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "dispatched",
        "in_progress",
        "completed",
        "cancelled",
      ],
      default: "pending",
    },
    assignedTruck: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Truck",
    },
    assignedDriver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    localGovernment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LocalGovernment",
    },
    confirmedDate: {
      type: Date,
    },
    confirmedTimeSlot: {
      type: String,
      enum: ["morning", "afternoon", "evening"],
    },
    dispatchedAt: {
      type: Date,
    },
    startedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
    cancelReason: {
      type: String,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "refunded", "free"],
      default: "pending",
    },
    paymentAmount: {
      type: Number,
      default: 0,
    },
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: String,
      submittedAt: Date,
    },
    photos: {
      before: [String],
      after: [String],
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringSchedule: {
      frequency: {
        type: String,
        enum: ["daily", "weekly", "bi-weekly", "monthly"],
      },
      endDate: Date,
    },
  },
  { timestamps: true }
);

// Generate unique request ID before saving
PickupRequestSchema.pre("save", async function (next) {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    this.requestId = `PR-${year}${month}-${random}`;
  }
  next();
});

// Create geospatial index for location-based queries
PickupRequestSchema.index({ "location.coordinates": "2dsphere" });

export default mongoose.models.PickupRequest ||
  mongoose.model("PickupRequest", PickupRequestSchema);
