// import { NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import connectDB from "@/lib/mongodb";
// import Vehicle from "@/models/Vehicle";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// // Get a single vehicle
// export async function GET(request, { params }) {
//   try {
//     const session = await getServerSession(authOptions);

//     if (!session || !session.user) {
//       return NextResponse.json(
//         { success: false, message: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     await connectDB();

//     const vehicle = await Vehicle.findById(params.id)
//       .populate("driver", "firstName lastName email")
//       .populate("localGovernment", "name region");

//     if (!vehicle) {
//       return NextResponse.json(
//         { success: false, message: "Vehicle not found" },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json({ success: true, data: vehicle }, { status: 200 });
//   } catch (error) {
//     return NextResponse.json(
//       { success: false, message: error.message },
//       { status: 500 }
//     );
//   }
// }

// // Update a vehicle
// export async function PUT(request, { params }) {
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

//     const vehicle = await Vehicle.findByIdAndUpdate(params.id, body, {
//       new: true,
//       runValidators: true,
//     });

//     if (!vehicle) {
//       return NextResponse.json(
//         { success: false, message: "Vehicle not found" },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json({ success: true, data: vehicle }, { status: 200 });
//   } catch (error) {
//     return NextResponse.json(
//       { success: false, message: error.message },
//       { status: 500 }
//     );
//   }
// }

// // Delete a vehicle
// export async function DELETE(request, { params }) {
//   try {
//     const session = await getServerSession(authOptions);

//     if (!session || !session.user || session.user.role !== "admin") {
//       return NextResponse.json(
//         { success: false, message: "Unauthorized - Admin access required" },
//         { status: 401 }
//       );
//     }

//     await connectDB();

//     const vehicle = await Vehicle.findByIdAndDelete(params.id);

//     if (!vehicle) {
//       return NextResponse.json(
//         { success: false, message: "Vehicle not found" },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json({ success: true, data: {} }, { status: 200 });
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
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import User from "@/models/User";

// Get a single vehicle
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

    const vehicle = await Vehicle.findById(params.id)
      .populate("driver", "firstName lastName email")
      .populate("localGovernment", "name region");

    if (!vehicle) {
      return NextResponse.json(
        { success: false, message: "Vehicle not found" },
        { status: 404 }
      );
    }

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }
    // Ensure admin can only access vehicles from their local government
    // if (
    //   session.user.role === "admin" &&
    //   vehicle.localGovernment.toString() !== user.localGovernment.toString()
    // ) {
    //   return NextResponse.json(
    //     { success: false, message: "Unauthorized to access this vehicle" },
    //     { status: 403 }
    //   );
    // }

    return NextResponse.json({ success: true, data: vehicle }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// Update a vehicle
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

    const vehicle = await Vehicle.findById(params.id);

    if (!vehicle) {
      return NextResponse.json(
        { success: false, message: "Vehicle not found" },
        { status: 404 }
      );
    }
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }
    // Ensure admin can only update vehicles from their local government
    if (
      vehicle.localGovernment.toString() !== user.localGovernment.toString()
    ) {
      return NextResponse.json(
        { success: false, message: "Unauthorized to update this vehicle" },
        { status: 403 }
      );
    }

    // Prevent changing registration number to an existing one
    if (
      body.registrationNumber &&
      body.registrationNumber !== vehicle.registrationNumber
    ) {
      const existingVehicle = await Vehicle.findOne({
        registrationNumber: body.registrationNumber,
      });

      if (existingVehicle) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Another vehicle with this registration number already exists",
          },
          { status: 400 }
        );
      }
    }

    const updatedVehicle = await Vehicle.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    }).populate("driver", "firstName lastName");

    return NextResponse.json(
      { success: true, data: updatedVehicle },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// Delete a vehicle
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

    const vehicle = await Vehicle.findById(params.id);

    if (!vehicle) {
      return NextResponse.json(
        { success: false, message: "Vehicle not found" },
        { status: 404 }
      );
    }

    // Ensure admin can only delete vehicles from their local government
    if (
      vehicle.localGovernment.toString() !==
      session.user.localGovernment.toString()
    ) {
      return NextResponse.json(
        { success: false, message: "Unauthorized to delete this vehicle" },
        { status: 403 }
      );
    }

    await Vehicle.findByIdAndDelete(params.id);

    return NextResponse.json(
      {
        success: true,
        message: "Vehicle deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
