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
      // The Error was here for hashing the password twice and the shcema pre-save hook was also hashing the password
      // const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        firstName,
        lastName,
        email,
        password,
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

// // src/app/api/users/route.js
// import { NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import connectDB from "@/lib/mongodb";
// import User from "@/models/User";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";
// import bcrypt from "bcryptjs";

// export async function POST(request) {
//   try {
//     const session = await getServerSession(authOptions);

//     if (!session || !session.user || session.user.role !== "admin") {
//       return NextResponse.json(
//         { success: false, message: "Unauthorized - Admin access required" },
//         { status: 401 }
//       );
//     }

//     const body = await request.json();
//     const { firstName, lastName, email, password, role, onboardingCompleted } = body;

//     await connectDB();

//     // Get admin's local government
//     const admin = await User.findById(session.user.id).select('localGovernment');

//     if (!admin || !admin.localGovernment) {
//       return NextResponse.json(
//         { success: false, message: "Admin not assigned to a local government" },
//         { status: 400 }
//       );
//     }

//     // Check if email already exists
//     const existingUser = await User.findOne({ email });

//     if (existingUser) {
//       return NextResponse.json(
//         { success: false, message: "Email already in use" },
//         { status: 400 }
//       );
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create new user
//     const newUser = await User.create({
//       firstName,
//       lastName,
//       email,
//       password: hashedPassword,
//       role: role || "user",
//       onboardingCompleted: onboardingCompleted || false,
//       localGovernment: admin.localGovernment // Assign to admin's local government
//     });

//     return NextResponse.json(
//       {
//         success: true,
//         message: "User created successfully",
//         user: {
//           id: newUser._id,
//           firstName: newUser.firstName,
//           lastName: newUser.lastName,
//           email: newUser.email,
//           role: newUser.role,
//           localGovernment: newUser.localGovernment
//         }
//       },
//       { status: 201 }
//     );
//   } catch (error) {
//     return NextResponse.json(
//       { success: false, message: error.message },
//       { status: 500 }
//     );
//   }
// }
