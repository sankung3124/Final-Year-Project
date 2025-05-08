import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import Pickup from "@/models/Pickup";
import Vehicle from "@/models/Vehicle";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Get pickups based on user role and filters
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
    const status = searchParams.get("status");
    const userId = searchParams.get("user");
    const vehicleId = searchParams.get("vehicle");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    const query = {};

    // Admin can see all pickups, users can only see their own
    if (session.user.role === "user") {
      query.user = session.user.id;
    } else if (session.user.role === "driver") {
      // Driver can only see pickups assigned to their vehicle
      const vehicle = await Vehicle.findOne({ driver: session.user.id });
      if (!vehicle) {
        return NextResponse.json(
          { success: false, message: "Driver not assigned to any vehicle" },
          { status: 400 }
        );
      }
      query.vehicle = vehicle._id;
    } else if (userId && session.user.role === "admin") {
      query.user = userId;
    }

    if (vehicleId && session.user.role === "admin") {
      query.vehicle = vehicleId;
    }

    if (status) {
      query.status = status;
    }

    if (dateFrom || dateTo) {
      query.scheduledDate = {};
      if (dateFrom) {
        query.scheduledDate.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        query.scheduledDate.$lte = new Date(dateTo);
      }
    }

    await connectDB();

    const pickups = await Pickup.find(query)
      .populate("user", "firstName lastName email")
      .populate({
        path: "vehicle",
        populate: {
          path: "driver",
          select: "firstName lastName email",
        },
      })
      .sort({ scheduledDate: -1 });

    return NextResponse.json({ success: true, data: pickups }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// Create a new pickup request
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Set the user ID from the session
    body.user = session.user.id;

    await connectDB();

    // Find the closest available vehicle if not specified
    if (!body.vehicle) {
      // Find vehicles in the same area that are available
      const availableVehicles = await Vehicle.find({
        status: "available",
      });

      if (availableVehicles.length > 0) {
        // Find the nearest vehicle based on coordinates
        let nearestVehicle = null;
        let shortestDistance = Infinity;

        for (const vehicle of availableVehicles) {
          if (vehicle.currentLocation) {
            const distance = calculateDistance(
              body.location.coordinates.lat,
              body.location.coordinates.lng,
              vehicle.currentLocation.lat,
              vehicle.currentLocation.lng
            );

            if (distance < shortestDistance) {
              shortestDistance = distance;
              nearestVehicle = vehicle;
            }
          }
        }

        if (nearestVehicle) {
          body.vehicle = nearestVehicle._id;
          body.status = "assigned";

          // Update vehicle status
          await Vehicle.findByIdAndUpdate(nearestVehicle._id, {
            status: "on_duty",
          });
        }
      }
    }

    const pickup = await Pickup.create(body);

    // Populate the user and vehicle for the response
    const populatedPickup = await Pickup.findById(pickup._id)
      .populate("user", "firstName lastName email")
      .populate({
        path: "vehicle",
        populate: {
          path: "driver",
          select: "firstName lastName email",
        },
      });

    return NextResponse.json(
      { success: true, data: populatedPickup },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}
