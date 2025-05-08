import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import Vehicle from "@/models/Vehicle";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Get all vehicles
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
    const localGovernmentId = searchParams.get("localGovernment");
    const status = searchParams.get("status");

    const query = {};

    if (localGovernmentId) {
      query.localGovernment = localGovernmentId;
    }

    if (status) {
      query.status = status;
    }

    await connectDB();

    const vehicles = await Vehicle.find(query)
      .populate("driver", "firstName lastName email")
      .populate("localGovernment", "name region");

    return NextResponse.json(
      { success: true, data: vehicles },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// Create a new vehicle
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    const body = await request.json();

    await connectDB();

    const vehicle = await Vehicle.create(body);

    return NextResponse.json({ success: true, data: vehicle }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
