import mongoose from "mongoose";

const LocalGovernmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    region: {
      type: String,
      required: [true, "Region is required"],
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    contactEmail: {
      type: String,
      required: [true, "Contact email is required"],
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },
    contactPhone: {
      type: String,
      required: [true, "Contact phone is required"],
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
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    coverageArea: {
      type: Number, // radius in kilometers
      default: 10,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

export default mongoose.models.LocalGovernment ||
  mongoose.model("LocalGovernment", LocalGovernmentSchema);
