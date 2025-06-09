import connectDB from "@/lib/mongodb";
import Pickup from "@/models/Pickup";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Vehicle from "@/models/Vehicle";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const userId = searchParams.get("user");
    const vehicleId = searchParams.get("vehicle");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    const query = {};

    await connectDB();
    if (session.user.role === "admin") {
      let localGovernmentId = searchParams.get("localGovernment");
      if (!localGovernmentId) {
        const admin = await User.findById(session.user.id).select(
          "localGovernment"
        );
        if (!admin || !admin.localGovernment) {
          return NextResponse.json(
            {
              success: false,
              message: "Admin not assigned to a local government",
            },
            { status: 400 }
          );
        }
        localGovernmentId = admin.localGovernment.toString();
      }
      query.localGovernment = localGovernmentId;
    } else if (session.user.role === "user") {
      query.user = session.user.id;
    } else if (session.user.role === "driver") {
      query.assignedDriver = session.user.id;
    }

    // Allow filtering by assignedDriver via query param (for dashboard, history, etc)
    const assignedDriverId = searchParams.get("assignedDriver");
    if (assignedDriverId) {
      query.assignedDriver = assignedDriverId;
    }

    if (vehicleId && session.user.role === "admin") {
      query.vehicle = vehicleId;
    }

    if (status) {
      query.status = status;
    }

    if (dateFrom || dateTo) {
      query.scheduledDate = {};
      if (dateFrom) {
        query.scheduledDate.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        query.scheduledDate.$lte = new Date(dateTo);
      }
    }

    const pickups = await Pickup.find(query)
      .populate("user", "firstName lastName email")
      .populate({
        path: "vehicle",
        populate: {
          path: "driver",
          select: "firstName lastName email",
        },
      })
      .populate("assignedDriver", "firstName lastName email")
      .sort({ scheduledDate: -1 });

    return NextResponse.json({ success: true, data: pickups }, { status: 200 });
  } catch (error) {
    console.error("Error in /api/pickups GET:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    console.log({ session });

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== "user") {
      return NextResponse.json(
        { success: false, message: "Only users can create pickups" },
        { status: 403 }
      );
    }
    const body = await request.json();
    await connectDB();

    // Validate localGovernment
    if (
      !body.localGovernment ||
      !body.localGovernment.match(/^[0-9a-fA-F]{24}$/)
    ) {
      return NextResponse.json(
        { success: false, message: "A valid localGovernment is required." },
        { status: 400 }
      );
    }

    const user = await User.findById(session.user.id).select(
      "localGovernment location"
    );
    const pickup = new Pickup({
      user: session.user.id,
      pickupType: body.pickupType,
      wasteDescription: body.wasteDescription,
      estimatedWeight: body.estimatedWeight || 0,
      location: body.location,
      scheduledDate: body.scheduledDate,
      preferredTimeSlot: body.preferredTimeSlot,
      notes: body.notes || "",
      status: "requested",
      localGovernment: body.localGovernment,
    });

    await pickup.save();
    const populatedPickup = await Pickup.findById(pickup._id).populate(
      "user",
      "firstName lastName email"
    );

    return NextResponse.json(
      { success: true, data: populatedPickup },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
