import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const update = searchParams.get("update");

    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "No active session" },
        { status: 401 }
      );
    }
    if (update === "true") {
      await connectDB();
      const user = await User.findById(session.user.id);

      if (user) {
        session.user.onboardingCompleted = user.onboardingCompleted;
        session.user.role = user.role;
      }
    }

    return NextResponse.json({ success: true, session }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
