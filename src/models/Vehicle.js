import mongoose from "mongoose";

const VehicleSchema = new mongoose.Schema(
  {
    registrationNumber: {
      type: String,
      required: [true, "Registration number is required"],
      unique: true,
      trim: true,
    },
    type: {
      type: String,
      required: [true, "Vehicle type is required"],
      enum: ["truck", "van", "other"],
      default: "truck",
    },
    capacity: {
      type: Number, // capacity in kilograms
      required: [true, "Capacity is required"],
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    localGovernment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LocalGovernment",
      required: [true, "Local government is required"],
    },
    currentLocation: {
      type: {
        lat: Number,
        lng: Number,
      },
      default: null,
    },
    status: {
      type: String,
      enum: ["available", "on_duty", "maintenance", "inactive"],
      default: "available",
    },
    lastMaintenance: {
      type: Date,
      default: null,
    },
    nextMaintenance: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Vehicle ||
  mongoose.model("Vehicle", VehicleSchema);
