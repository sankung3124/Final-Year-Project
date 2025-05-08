import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import Pickup from "@/models/Pickup";
import Vehicle from "@/models/Vehicle";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Get a single pickup
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const pickup = await Pickup.findById(params.id)
      .populate("user", "firstName lastName email")
      .populate({
        path: "vehicle",
        populate: {
          path: "driver",
          select: "firstName lastName email",
        },
      });

    if (!pickup) {
      return NextResponse.json(
        { success: false, message: "Pickup not found" },
        { status: 404 }
      );
    }

    // Check if the user has permission to view this pickup
    if (
      session.user.role === "user" &&
      pickup.user._id.toString() !== session.user.id
    ) {
      return NextResponse.json(
        { success: false, message: "Unauthorized - Not your pickup" },
        { status: 403 }
      );
    }

    // For drivers, check if the pickup is assigned to their vehicle
    if (session.user.role === "driver") {
      const vehicle = await Vehicle.findOne({ driver: session.user.id });

      if (
        !vehicle ||
        !pickup.vehicle ||
        pickup.vehicle._id.toString() !== vehicle._id.toString()
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Unauthorized - Not assigned to your vehicle",
          },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({ success: true, data: pickup }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// Update a pickup
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    await connectDB();

    const pickup = await Pickup.findById(params.id);

    if (!pickup) {
      return NextResponse.json(
        { success: false, message: "Pickup not found" },
        { status: 404 }
      );
    }

    // Check permissions based on role and update status
    if (session.user.role === "user") {
      // Users can only update their own pickups and only certain fields
      if (pickup.user.toString() !== session.user.id) {
        return NextResponse.json(
          { success: false, message: "Unauthorized - Not your pickup" },
          { status: 403 }
        );
      }

      // Users can only cancel pickups or update feedback
      if (body.status && body.status !== "cancelled") {
        delete body.status;
      }

      // Only allow specific fields to be updated by users
      const allowedFields = ["status", "notes", "feedback"];
      Object.keys(body).forEach((key) => {
        if (!allowedFields.includes(key)) {
          delete body[key];
        }
      });
    } else if (session.user.role === "driver") {
      // Drivers can only update pickups assigned to their vehicle
      const vehicle = await Vehicle.findOne({ driver: session.user.id });

      if (
        !vehicle ||
        !pickup.vehicle ||
        pickup.vehicle.toString() !== vehicle._id.toString()
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Unauthorized - Not assigned to your vehicle",
          },
          { status: 403 }
        );
      }

      // Drivers can update status to in_progress or completed
      if (body.status && !["in_progress", "completed"].includes(body.status)) {
        delete body.status;
      }

      // If status is completed, set completedAt date
      if (body.status === "completed") {
        body.completedAt = new Date();

        // Update vehicle status to available
        await Vehicle.findByIdAndUpdate(vehicle._id, {
          status: "available",
        });
      }

      // Only allow specific fields to be updated by drivers
      const allowedFields = ["status", "notes", "actualWeight", "completedAt"];
      Object.keys(body).forEach((key) => {
        if (!allowedFields.includes(key)) {
          delete body[key];
        }
      });
    }

    const updatedPickup = await Pickup.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    })
      .populate("user", "firstName lastName email")
      .populate({
        path: "vehicle",
        populate: {
          path: "driver",
          select: "firstName lastName email",
        },
      });

    return NextResponse.json(
      { success: true, data: updatedPickup },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// Delete a pickup
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const pickup = await Pickup.findById(params.id);

    if (!pickup) {
      return NextResponse.json(
        { success: false, message: "Pickup not found" },
        { status: 404 }
      );
    }

    // Only admins or the user who created the pickup can delete it
    if (
      session.user.role !== "admin" &&
      pickup.user.toString() !== session.user.id
    ) {
      return NextResponse.json(
        { success: false, message: "Unauthorized to delete this pickup" },
        { status: 403 }
      );
    }

    await Pickup.findByIdAndDelete(params.id);

    return NextResponse.json({ success: true, data: {} }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
