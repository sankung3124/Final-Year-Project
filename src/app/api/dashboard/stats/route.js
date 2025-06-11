import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Pickup from "@/models/Pickup";
import Vehicle from "@/models/Vehicle";
// export async function GET(request) {
//   try {
//     const session = await getServerSession(authOptions);

//     if (!session || !session.user) {
//       return NextResponse.json(
//         { success: false, message: "Unauthorized" },
//         { status: 401 }
//       );
//     }
//     console.log("Session User:", session.user);
//     await connectDB();

//     const { searchParams } = new URL(request.url);
//     const localGovernmentId = searchParams.get("localGovernment");

//     let stats = {};
//     let queryFilter = {};
//     if (session.user.role === "admin") {
//       if (!localGovernmentId) {
//         const admin = await User.findById(session.user.id).select(
//           "localGovernment"
//         );

//         if (!admin || !admin.localGovernment) {
//           return NextResponse.json(
//             {
//               success: false,
//               message: "Admin not assigned to a local government",
//             },
//             { status: 400 }
//           );
//         }

//         queryFilter.localGovernment = admin.localGovernment;
//       } else {
//         queryFilter.localGovernment = localGovernmentId;
//       }
//       const localUsers = await User.find({
//         localGovernment: queryFilter.localGovernment,
//       }).select("_id");

//       const userIds = localUsers.map((user) => user._id);
//       const pickupCount = await Pickup.countDocuments({
//         user: { $in: userIds },
//       });
//       const completedPickups = await Pickup.countDocuments({
//         user: { $in: userIds },
//         status: "completed",
//       });
//       const pendingPickups = await Pickup.countDocuments({
//         user: { $in: userIds },
//         status: { $in: ["requested", "scheduled", "assigned"] },
//       });
//       const vehicleCount = await Vehicle.countDocuments({
//         localGovernment: queryFilter.localGovernment,
//       });
//       const userCount = await User.countDocuments({
//         localGovernment: queryFilter.localGovernment,
//         role: "user",
//       });
//       const driverCount = await User.countDocuments({
//         localGovernment: queryFilter.localGovernment,
//         role: "driver",
//       });
//       const waste = await Pickup.aggregate([
//         {
//           $match: {
//             user: { $in: userIds },
//             status: "completed",
//             actualWeight: { $gt: 0 },
//           },
//         },
//         { $group: { _id: null, total: { $sum: "$actualWeight" } } },
//       ]);

//       const totalWaste = waste.length > 0 ? waste[0].total : 0;
//       const recentPickups = await Pickup.find({ user: { $in: userIds } })
//         .sort({ scheduledDate: -1 })
//         .limit(5)
//         .populate("user", "firstName lastName")
//         .populate({
//           path: "vehicle",
//           populate: {
//             path: "driver",
//             select: "firstName lastName",
//           },
//         });

//       stats = {
//         pickupCount,
//         completedPickups,
//         pendingPickups,
//         vehicleCount,
//         userCount,
//         driverCount,
//         totalWaste,
//         recentPickups,
//       };
//     } else if (session.user.role === "driver") {
//     } else {
//       // here we'll not filter by local government. just this is nrmal user wh did the pickyp. so find by userId.
//       const userId = session.user.id;
//       const pickupCount = await Pickup.countDocuments({ user: userId });
//       const completedPickups = await Pickup.countDocuments({
//         user: userId,
//         status: "completed",
//       });
//       const pendingPickups = await Pickup.countDocuments({
//         user: userId,
//         status: { $in: ["requested", "scheduled", "assigned"] },
//       });
//       const vehicleCount = await Vehicle.countDocuments({ driver: userId });
//       const userCount = await User.countDocuments({ role: "user" });
//       // const driverCount = await User.countDocuments({ role: "driver" });
//       const waste = await Pickup.aggregate([
//         {
//           $match: {
//             user: userId,
//             status: "completed",
//             actualWeight: { $gt: 0 },
//           },
//         },
//         { $group: { _id: null, total: { $sum: "$actualWeight" } } },
//       ]);
//       const totalWaste = waste.length > 0 ? waste[0].total : 0;
//       const recentPickups = await Pickup.find({ user: userId }).sort({ scheduledDate: -1 })

//     }

//     return NextResponse.json({ success: true, data: stats }, { status: 200 });
//   } catch (error) {
//     return NextResponse.json(
//       { success: false, message: error.message },
//       { status: 500 }
//     );
//   }
// }

// import { getServerSession } from "next-auth/next";
// import { NextResponse } from "next/server";
// import connectDB from "@/config/database";
// import User from "@/models/User";
// import Pickup from "@/models/Pickup";
// import Vehicle from "@/models/Vehicle";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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
    const { searchParams } = new URL(request.url);
    const localGovernmentId = searchParams.get("localGovernment");

    let stats = {};
    let queryFilter = {};

    // Admin Dashboard
    if (session.user.role === "admin") {
      // Admin logic remains the same as before
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

        queryFilter.localGovernment = admin.localGovernment;
      } else {
        queryFilter.localGovernment = localGovernmentId;
      }

      const localUsers = await User.find({
        localGovernment: queryFilter.localGovernment,
      }).select("_id");

      const userIds = localUsers.map((user) => user._id);

      // Admin statistics
      const pickupCount = await Pickup.countDocuments({
        user: { $in: userIds },
      });
      const completedPickups = await Pickup.countDocuments({
        user: { $in: userIds },
        status: "completed",
      });
      const pendingPickups = await Pickup.countDocuments({
        user: { $in: userIds },
        status: { $in: ["requested", "scheduled", "assigned"] },
      });
      const vehicleCount = await Vehicle.countDocuments({
        localGovernment: queryFilter.localGovernment,
      });
      const userCount = await User.countDocuments({
        localGovernment: queryFilter.localGovernment,
        role: "user",
      });
      const driverCount = await User.countDocuments({
        localGovernment: queryFilter.localGovernment,
        role: "driver",
      });

      const waste = await Pickup.aggregate([
        {
          $match: {
            user: { $in: userIds },
            status: "completed",
            actualWeight: { $gt: 0 },
          },
        },
        { $group: { _id: null, total: { $sum: "$actualWeight" } } },
      ]);

      const totalWaste = waste.length > 0 ? waste[0].total : 0;

      const recentPickups = await Pickup.find({ user: { $in: userIds } })
        .sort({ scheduledDate: -1 })
        .limit(5)
        .populate("user", "firstName lastName")
        .populate({
          path: "vehicle",
          populate: {
            path: "driver",
            select: "firstName lastName",
          },
        });

      stats = {
        pickupCount,
        completedPickups,
        pendingPickups,
        vehicleCount,
        userCount,
        driverCount,
        totalWaste,
        recentPickups,
      };
    }
    // Driver Dashboard
    else if (session.user.role === "driver") {
      const driverId = session.user.id;

      // Get driver's assigned vehicle
      const vehicle = await Vehicle.findOne({ driver: driverId });

      // Driver statistics
      const pickupCount = await Pickup.countDocuments({
        driver: driverId,
      });

      const completedPickups = await Pickup.countDocuments({
        driver: driverId,
        status: "completed",
      });

      const pendingPickups = await Pickup.countDocuments({
        driver: driverId,
        status: { $in: ["assigned", "in_progress"] },
      });

      const waste = await Pickup.aggregate([
        {
          $match: {
            driver: driverId,
            status: "completed",
            actualWeight: { $gt: 0 },
          },
        },
        { $group: { _id: null, total: { $sum: "$actualWeight" } } },
      ]);

      const totalWaste = waste.length > 0 ? waste[0].total : 0;

      // Next scheduled pickup for driver
      const nextScheduledPickup = await Pickup.findOne({
        driver: driverId,
        status: { $in: ["scheduled", "assigned"] },
        scheduledDate: { $gte: new Date() },
      }).sort({ scheduledDate: 1 });

      // Recent pickups for driver
      const recentPickups = await Pickup.find({ driver: driverId })
        .sort({ scheduledDate: -1 })
        .limit(5)
        .populate("user", "firstName lastName");

      stats = {
        pickupCount,
        completedPickups,
        pendingPickups,
        totalWaste,
        nextScheduledPickup,
        recentPickups,
        assignedVehicle: vehicle || null,
      };
    }
    // User Dashboard (as shown in the image)
    else {
      const userId = session.user.id;
      console.log("User ID:", userId);

      // User statistics
      const pickupCount = await Pickup.countDocuments({ user: userId });
      const completedPickups = await Pickup.countDocuments({
        user: userId,
        status: "completed",
      });
      const pendingPickups = await Pickup.countDocuments({
        user: userId,
        status: { $in: ["requested", "scheduled", "assigned"] },
      });

      const waste = await Pickup.aggregate([
        {
          $match: {
            user: userId,
            status: "completed",
            actualWeight: { $gt: 0 },
          },
        },
        { $group: { _id: null, total: { $sum: "$actualWeight" } } },
      ]);

      const totalWaste = waste.length > 0 ? waste[0].total : 0;

      // Next scheduled pickup for user
      const nextScheduledPickup = await Pickup.findOne({
        user: userId,
        status: { $in: ["scheduled", "assigned"] },
        scheduledDate: { $gte: new Date() },
      }).sort({ scheduledDate: 1 });

      // Recent pickups for user
      const recentPickups = await Pickup.find({ user: userId })
        .sort({ scheduledDate: -1 })
        .limit(5)
        .populate({
          path: "vehicle",
          populate: {
            path: "driver",
            select: "firstName lastName",
          },
        });

      stats = {
        pickupCount,
        completedPickups,
        pendingPickups,
        totalWaste,
        nextScheduledPickup: nextScheduledPickup || null,
        recentPickups,
      };
    }

    return NextResponse.json({ success: true, data: stats }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
