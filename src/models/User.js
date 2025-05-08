import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "driver", "admin"],
      default: "user",
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
    location: {
      address: String,
      city: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    profileImage: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      trim: true,
    },
    // Driver specific fields
    drivingLicense: {
      number: String,
      expiryDate: Date,
      verified: {
        type: Boolean,
        default: false,
      },
    },
    assignedTruck: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Truck",
    },
    // Admin specific fields
    localGovernment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LocalGovernment",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.models.User || mongoose.model("User", UserSchema);
