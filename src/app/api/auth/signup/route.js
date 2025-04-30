import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { signupSchema } from "@/lib/schema/auth";

export async function POST(request) {
  try {
    const body = await request.json();
    try {
      const { firstName, lastName, email, password } = signupSchema.parse(body);

      await connectDB();
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return NextResponse.json(
          { success: false, message: "Email already in use" },
          { status: 400 }
        );
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: "user",
        onboardingCompleted: false,
      });

      return NextResponse.json(
        {
          success: true,
          message: "User registered successfully",
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
          },
        },
        { status: 201 }
      );
    } catch (validationError) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: validationError.errors || validationError.message,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Registration failed", error: error.message },
      { status: 500 }
    );
  }
}
