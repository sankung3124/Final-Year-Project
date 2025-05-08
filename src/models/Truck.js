import mongoose from "mongoose";

const TruckSchema = new mongoose.Schema(
  {
    registrationNumber: {
      type: String,
      required: [true, "Registration number is required"],
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, "Truck name is required"],
      trim: true,
    },
    model: {
      type: String,
      required: [true, "Truck model is required"],
      trim: true,
    },
    capacity: {
      type: Number,
      required: [true, "Capacity is required"],
    },
    capacityUnit: {
      type: String,
      enum: ["tons", "cubic_meters", "kg"],
      default: "tons",
    },
    status: {
      type: String,
      enum: ["active", "maintenance", "inactive"],
      default: "active",
    },
    currentLocation: {
      address: String,
      city: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    assignedDriver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    localGovernment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LocalGovernment",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastMaintenance: {
      type: Date,
      default: Date.now,
    },
    nextMaintenanceDue: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Create geospatial index for location-based queries
TruckSchema.index({ "currentLocation.coordinates": "2dsphere" });

export default mongoose.models.Truck || mongoose.model("Truck", TruckSchema);
