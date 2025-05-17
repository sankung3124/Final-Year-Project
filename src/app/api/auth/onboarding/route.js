import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized - No valid session" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { address, city, coordinates } = await request.json();

    await connectDB();

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        location: {
          address,
          city,
          coordinates,
        },
        onboardingCompleted: true,
      },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Onboarding completed successfully",
        user: {
          id: updatedUser._id,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          onboardingCompleted: updatedUser.onboardingCompleted,
          location: updatedUser.location,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.log({error})
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update user profile",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
