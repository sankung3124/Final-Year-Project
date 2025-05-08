import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import Pickup from "@/models/Pickup";
import Vehicle from "@/models/Vehicle";
import User from "@/models/User";
import LocalGovernment from "@/models/LocalGovernment";
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

    await connectDB();

    const { searchParams } = new URL(request.url);
    const localGovernmentId = searchParams.get("localGovernment");

    let stats = {};

    if (session.user.role === "admin") {
      // Admin stats
      const pickupCount = await Pickup.countDocuments({});
      const completedPickups = await Pickup.countDocuments({
        status: "completed",
      });
      const pendingPickups = await Pickup.countDocuments({
        status: { $in: ["requested", "scheduled", "assigned"] },
      });
      const vehicleCount = await Vehicle.countDocuments({});
      const userCount = await User.countDocuments({ role: "user" });
      const driverCount = await User.countDocuments({ role: "driver" });

      // Calculate total waste collected
      const waste = await Pickup.aggregate([
        { $match: { status: "completed", actualWeight: { $gt: 0 } } },
        { $group: { _id: null, total: { $sum: "$actualWeight" } } },
      ]);

      const totalWaste = waste.length > 0 ? waste[0].total : 0;

      // Recent pickups
      const recentPickups = await Pickup.find({})
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

      // Pickup data by status
      const pickupStats = await Pickup.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]);

      // Pickup data by month
      const currentYear = new Date().getFullYear();
      const pickupsByMonth = await Pickup.aggregate([
        {
          $match: {
            scheduledDate: {
              $gte: new Date(`${currentYear}-01-01`),
              $lte: new Date(`${currentYear}-12-31`),
            },
          },
        },
        {
          $group: {
            _id: { $month: "$scheduledDate" },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      stats = {
        pickupCount,
        completedPickups,
        pendingPickups,
        vehicleCount,
        userCount,
        driverCount,
        totalWaste,
        pickupStats: pickupStats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        pickupsByMonth: Array.from({ length: 12 }, (_, i) => i + 1).map(
          (month) => {
            const found = pickupsByMonth.find((item) => item._id === month);
            return {
              month,
              count: found ? found.count : 0,
            };
          }
        ),
        recentPickups,
      };
    } else if (session.user.role === "driver") {
      // Driver stats
      const vehicle = await Vehicle.findOne({ driver: session.user.id });

      if (!vehicle) {
        return NextResponse.json(
          { success: false, message: "Driver not assigned to any vehicle" },
          { status: 400 }
        );
      }

      const assignedPickups = await Pickup.countDocuments({
        vehicle: vehicle._id,
      });
      const completedPickups = await Pickup.countDocuments({
        vehicle: vehicle._id,
        status: "completed",
      });
      const pendingPickups = await Pickup.countDocuments({
        vehicle: vehicle._id,
        status: { $in: ["assigned", "in_progress"] },
      });

      // Calculate total waste collected by this driver
      const waste = await Pickup.aggregate([
        {
          $match: {
            vehicle: vehicle._id,
            status: "completed",
            actualWeight: { $gt: 0 },
          },
        },
        { $group: { _id: null, total: { $sum: "$actualWeight" } } },
      ]);

      const totalWaste = waste.length > 0 ? waste[0].total : 0;

      // Upcoming pickups
      const upcomingPickups = await Pickup.find({
        vehicle: vehicle._id,
        status: { $in: ["assigned", "in_progress"] },
        scheduledDate: { $gte: new Date() },
      })
        .sort({ scheduledDate: 1 })
        .limit(5)
        .populate("user", "firstName lastName");

      stats = {
        vehicleInfo: {
          registrationNumber: vehicle.registrationNumber,
          type: vehicle.type,
          status: vehicle.status,
        },
        assignedPickups,
        completedPickups,
        pendingPickups,
        totalWaste,
        upcomingPickups,
      };
    } else {
      // Regular user stats
      const userPickups = await Pickup.countDocuments({
        user: session.user.id,
      });
      const completedPickups = await Pickup.countDocuments({
        user: session.user.id,
        status: "completed",
      });
      const pendingPickups = await Pickup.countDocuments({
        user: session.user.id,
        status: { $in: ["requested", "scheduled", "assigned", "in_progress"] },
      });

      // Calculate total waste collected by the user
      const waste = await Pickup.aggregate([
        {
          $match: {
            user: session.user.id,
            status: "completed",
            actualWeight: { $gt: 0 },
          },
        },
        { $group: { _id: null, total: { $sum: "$actualWeight" } } },
      ]);

      const totalWaste = waste.length > 0 ? waste[0].total : 0;

      // Next scheduled pickup
      const nextPickup = await Pickup.findOne({
        user: session.user.id,
        status: { $in: ["requested", "scheduled", "assigned"] },
        scheduledDate: { $gte: new Date() },
      })
        .sort({ scheduledDate: 1 })
        .populate({
          path: "vehicle",
          populate: {
            path: "driver",
            select: "firstName lastName",
          },
        });

      // Recent pickup history
      const recentPickups = await Pickup.find({
        user: session.user.id,
      })
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
        userPickups,
        completedPickups,
        pendingPickups,
        totalWaste,
        nextPickup,
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
