import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import LocalGovernment from "@/models/LocalGovernment";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Get all local governments
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const localGovernments = await LocalGovernment.find().populate(
      "admins",
      "firstName lastName email"
    );

    return NextResponse.json(
      { success: true, data: localGovernments },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// Create a new local government
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

    const localGovernment = await LocalGovernment.create(body);

    return NextResponse.json(
      { success: true, data: localGovernment },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
