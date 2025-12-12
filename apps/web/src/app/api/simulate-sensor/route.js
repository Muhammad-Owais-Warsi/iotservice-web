import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Helper endpoint to simulate IoT sensor data for testing
export async function POST(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { deviceId, temperature, humidity, electricity, doorStatus } = body;

    if (!deviceId) {
      return Response.json({ error: "Device ID is required" }, { status: 400 });
    }

    // Call the sensor-data endpoint to process the reading
    const sensorResponse = await fetch(
      `${process.env.APP_URL}/api/sensor-data`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          deviceId,
          temperature: temperature || 25,
          humidity: humidity || 60,
          electricity: electricity || 100,
          doorStatus: doorStatus || "closed",
        }),
      },
    );

    const result = await sensorResponse.json();

    return Response.json({
      success: true,
      message: "Sensor data simulated",
      result,
    });
  } catch (error) {
    console.error("POST /api/simulate-sensor error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
