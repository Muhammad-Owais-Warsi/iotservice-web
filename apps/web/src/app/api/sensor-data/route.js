import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// GET endpoint to fetch sensor data history
export async function GET(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get("deviceId");
    const limit = parseInt(searchParams.get("limit") || "100");
    const hours = parseInt(searchParams.get("hours") || "24");

    if (!deviceId) {
      return Response.json({ error: "Device ID is required" }, { status: 400 });
    }

    const hoursAgo = new Date(Date.now() - hours * 60 * 60 * 1000);

    const readings = await sql`
      SELECT *
      FROM sensor_data
      WHERE device_id = ${deviceId}
      AND recorded_at >= ${hoursAgo.toISOString()}
      ORDER BY recorded_at DESC
      LIMIT ${limit}
    `;

    return Response.json({ readings });
  } catch (error) {
    console.error("GET /api/sensor-data error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST endpoint for IoT devices to submit sensor readings
export async function POST(request) {
  try {
    const body = await request.json();
    const { deviceId, temperature, humidity, electricity, doorStatus } = body;

    if (!deviceId) {
      return Response.json({ error: "Device ID is required" }, { status: 400 });
    }

    // Insert the new sensor data
    await sql`
      INSERT INTO sensor_data (device_id, temperature, humidity, electricity, door_status, recorded_at)
      VALUES (${deviceId}, ${temperature}, ${humidity}, ${electricity}, ${doorStatus}, NOW())
    `;

    // Get device info and thresholds
    const deviceInfo = await sql`
      SELECT d.*, l.id as location_id, l.company_id
      FROM devices d
      JOIN locations l ON d.location_id = l.id
      WHERE d.id = ${deviceId}
      LIMIT 1
    `;

    if (deviceInfo.length === 0) {
      return Response.json({ success: true });
    }

    const device = deviceInfo[0];

    // Check if current reading exceeds thresholds AND door is closed
    const exceedsThreshold =
      (temperature > device.temp_threshold ||
        humidity > device.humidity_threshold) &&
      doorStatus === "closed";

    if (!exceedsThreshold) {
      // Condition not met - resolve any active alerts for this device
      await sql`
        UPDATE alerts 
        SET status = 'resolved'
        WHERE device_id = ${deviceId} 
        AND status = 'active'
      `;
      return Response.json({ success: true });
    }

    // Check if condition has persisted for >5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const recentReadings = await sql`
      SELECT temperature, humidity, door_status, recorded_at
      FROM sensor_data
      WHERE device_id = ${deviceId}
      AND recorded_at >= ${fiveMinutesAgo.toISOString()}
      ORDER BY recorded_at ASC
    `;

    // Check if ALL readings in the last 5 minutes meet the alert condition
    const allMeetCondition = recentReadings.every(
      (reading) =>
        (parseFloat(reading.temperature) > device.temp_threshold ||
          parseFloat(reading.humidity) > device.humidity_threshold) &&
        reading.door_status === "closed",
    );

    if (!allMeetCondition || recentReadings.length === 0) {
      // Condition hasn't persisted for 5 minutes yet
      return Response.json({ success: true });
    }

    // Check if there's already an active alert for this device
    const existingAlert = await sql`
      SELECT id FROM alerts
      WHERE device_id = ${deviceId}
      AND status = 'active'
      LIMIT 1
    `;

    if (existingAlert.length === 0) {
      // Create new alert
      const alertType =
        temperature > device.temp_threshold &&
        humidity > device.humidity_threshold
          ? "Temperature & Humidity Alert"
          : temperature > device.temp_threshold
            ? "Temperature Alert"
            : "Humidity Alert";

      const message =
        temperature > device.temp_threshold &&
        humidity > device.humidity_threshold
          ? `Temperature (${temperature}°C) and Humidity (${humidity}%) exceed thresholds while door is closed for >5 minutes`
          : temperature > device.temp_threshold
            ? `Temperature (${temperature}°C) exceeds threshold (${device.temp_threshold}°C) while door is closed for >5 minutes`
            : `Humidity (${humidity}%) exceeds threshold (${device.humidity_threshold}%) while door is closed for >5 minutes`;

      const severity =
        temperature > device.temp_threshold + 5 ||
        humidity > device.humidity_threshold + 10
          ? "critical"
          : "warning";

      await sql`
        INSERT INTO alerts (
          device_id, 
          location_id, 
          alert_type, 
          message, 
          severity,
          condition_started_at
        )
        VALUES (
          ${deviceId},
          ${device.location_id},
          ${alertType},
          ${message},
          ${severity},
          ${recentReadings[0].recorded_at}
        )
      `;
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("POST /api/sensor-data error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
