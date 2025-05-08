import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import LocalGovernment from "@/models/LocalGovernment";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Get a single local government
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

    const localGovernment = await LocalGovernment.findById(params.id).populate(
      "admins",
      "firstName lastName email"
    );

    if (!localGovernment) {
      return NextResponse.json(
        { success: false, message: "Local government not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: localGovernment },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// Update a local government
export async function PUT(request, { params }) {
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

    const localGovernment = await LocalGovernment.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    );

    if (!localGovernment) {
      return NextResponse.json(
        { success: false, message: "Local government not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: localGovernment },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// Delete a local government
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    await connectDB();

    const localGovernment = await LocalGovernment.findByIdAndDelete(params.id);

    if (!localGovernment) {
      return NextResponse.json(
        { success: false, message: "Local government not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: {} }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
