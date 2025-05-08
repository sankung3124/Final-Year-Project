import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Pickup from "@/models/Pickup";
import Vehicle from "@/models/Vehicle";
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
    if (session.user.role === "admin") {
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
    } else if (session.user.role === "driver") {
    } else {
    }

    return NextResponse.json({ success: true, data: stats }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
