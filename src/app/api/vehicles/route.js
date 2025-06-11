// import { NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import connectDB from "@/lib/mongodb";
// import Vehicle from "@/models/Vehicle";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// export async function GET(request) {
//   try {
//     const session = await getServerSession(authOptions);

//     if (!session || !session.user) {
//       return NextResponse.json(
//         { success: false, message: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     const { searchParams } = new URL(request.url);
//     const localGovernmentId = searchParams.get("localGovernment");
//     const status = searchParams.get("status");

//     const query = {};

//     if (localGovernmentId) {
//       query.localGovernment = localGovernmentId;
//     }

//     if (status) {
//       query.status = status;
//     }

//     await connectDB();

//     const vehicles = await Vehicle.find(query)
//       .populate("driver", "firstName lastName email")
//       .populate("localGovernment", "name region");

//     return NextResponse.json(
//       { success: true, data: vehicles },
//       { status: 200 }
//     );
//   } catch (error) {
//     return NextResponse.json(
//       { success: false, message: error.message },
//       { status: 500 }
//     );
//   }
// }

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

//     await connectDB();

//     const vehicle = await Vehicle.create(body);

//     return NextResponse.json({ success: true, data: vehicle }, { status: 201 });
//   } catch (error) {
//     return NextResponse.json(
//       { success: false, message: error.message },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import Vehicle from "@/models/Vehicle";
import User from "@/models/User";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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
    const availableOnly = searchParams.get("availableOnly") === "true";

    const query = {};

    // Admin can only see vehicles from their local government
    if (session.user.role === "admin") {
      query.localGovernment = session.user.localGovernment;
    }

    if (localGovernmentId) {
      query.localGovernment = localGovernmentId;
    }

    if (status) {
      query.status = status;
    }

    if (availableOnly) {
      query.status = "available";
      query.driver = { $exists: false };
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

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    const user = await User.findById(session.user.id);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Add admin's local government if not provided
    // if (!body.localGovernment && session.user.localGovernment) {
    //   body.localGovernment = user.localGovernment;
    // }

    await connectDB();

    // Check if registration number already exists
    const existingVehicle = await Vehicle.findOne({
      registrationNumber: body.registrationNumber,
    });

    if (existingVehicle) {
      return NextResponse.json(
        {
          success: false,
          message: "Vehicle with this registration number already exists",
        },
        { status: 400 }
      );
    }

    const vehicle = await Vehicle.create({
      ...body,
      localGovernment: user?.localGovernment,
    });

    return NextResponse.json({ success: true, data: vehicle }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
