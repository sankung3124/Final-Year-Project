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

    await connectDB();
    if (session.user.role === "admin") {
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
      const localUsers = await User.find({
        localGovernment: admin.localGovernment,
      }).select("_id");
      const userIds = localUsers.map((user) => user._id);
      query.user = { $in: userIds };
      if (userId) {
        query.user = userId;
      }
    } else if (session.user.role === "user") {
      query.user = session.user.id;
    } else if (session.user.role === "driver") {
      const vehicle = await Vehicle.findOne({ driver: session.user.id });
      if (!vehicle) {
        return NextResponse.json(
          { success: false, message: "Driver not assigned to any vehicle" },
          { status: 400 }
        );
      }
      query.vehicle = vehicle._id;
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
