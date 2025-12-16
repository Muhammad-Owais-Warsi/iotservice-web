import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";
import { sendEmail } from "../utils/email";

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
    // Check if there's already an active alert for this device
    const existingAlerts = await sql`
      SELECT id, condition_started_at, escalation_level FROM alerts
      WHERE device_id = ${deviceId}
      AND status = 'active'
      LIMIT 1
    `;

    // Helper to fetch emails by role
    const getEmailsByRole = async (role, companyId = null, locationId = null) => {
      let query;
      if (role === 'admin') {
        // Admins are global or per company? Prompt implies one Admin (Cueron). 
        // We'll fetch all admins for simplicity or filtered by company if strictly multi-tenant.
        // Assuming Super Admin for now, or Admin validation
        query = sql`SELECT email FROM user_profiles WHERE role = 'admin'`;
      } else if (role === 'master') {
        query = sql`SELECT email FROM user_profiles WHERE role = 'master' AND company_id = ${companyId}`;
      } else if (role === 'employee') {
        // Engineer usually linked to location
        query = sql`SELECT email FROM user_profiles WHERE role = 'employee' AND location_id = ${locationId}`;
      }
      const users = await query;
      return users.map(u => u.email);
    };

    if (existingAlerts.length === 0) {
      // No active alert yet. Check if we crossed the 5-minute threshold.
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
      // AND we have at least one reading from 5 mins ago (to prove duration)
      const allMeetCondition = recentReadings.length > 0 && recentReadings.every(
        (reading) =>
          (parseFloat(reading.temperature) > device.temp_threshold ||
            parseFloat(reading.humidity) > device.humidity_threshold) &&
          reading.door_status === "closed",
      );

      const oldestReading = recentReadings[0];
      const timeDiff = oldestReading ? (Date.now() - new Date(oldestReading.recorded_at).getTime()) : 0;
      const isFiveMins = allMeetCondition && timeDiff >= (5 * 60 * 1000);

      if (isFiveMins) {
        // CREATE INITIAL ALERT (5 mins)
        const alertType =
          temperature > device.temp_threshold &&
            humidity > device.humidity_threshold
            ? "Temperature & Humidity Alert"
            : temperature > device.temp_threshold
              ? "Temperature Alert"
              : "Humidity Alert";

        const message = `Anomaly detected: ${alertType}. Reading maintained for >5 minutes.`;
        const severity = "warning";

        await sql`
            INSERT INTO alerts (
              device_id, 
              location_id, 
              alert_type, 
              message, 
              severity,
              condition_started_at,
              escalation_level
            )
            VALUES (
              ${deviceId},
              ${device.location_id},
              ${alertType},
              ${message},
              ${severity},
              ${oldestReading.recorded_at},
              0
            )
          `;

        // NOTIFY ENGINEERS
        // NOTIFY ENGINEERS

        const engineerEmails = await getEmailsByRole('employee', null, device.location_id);
        if (engineerEmails.length > 0) {
          await sendEmail({
            to: engineerEmails,
            subject: `[ALERT] ${alertType} at ${device.location_id}`,
            text: message
          });
        }
      }
    } else {
      // Active Alert Exists - Check Escalation
      const alert = existingAlerts[0];
      const durationMs = Date.now() - new Date(alert.condition_started_at).getTime();
      const durationMins = durationMs / 1000 / 60;

      // Level 1: > 15 Minutes -> Notify Master


      // Level 1: > 15 Minutes -> Notify Master
      if (durationMins >= 15 && alert.escalation_level < 1) {
        const masterEmails = await getEmailsByRole('master', device.company_id);
        if (masterEmails.length > 0) {
          await sendEmail({
            to: masterEmails,
            subject: `[ESCALATION] Alert active for 15+ mins at Location ${device.location_id}`,
            text: `Alert has been active for ${Math.floor(durationMins)} minutes. Please investigate.`
          });
        }
        // Upgrade Level
        await sql`UPDATE alerts SET escalation_level = 1 WHERE id = ${alert.id}`;
      }

      // Level 2: > 30 Minutes -> Notify Admin
      else if (durationMins >= 30 && alert.escalation_level < 2) {
        const adminEmails = await getEmailsByRole('admin');
        if (adminEmails.length > 0) {
          await sendEmail({
            to: adminEmails,
            subject: `[CRITICAL ESCALATION] Alert active for 30+ mins at Location ${device.location_id}`,
            text: `CRITICAL: Alert has been active for ${Math.floor(durationMins)} minutes. System anomaly persisting.`
          });
        }
        // Upgrade Level
        await sql`UPDATE alerts SET escalation_level = 2 WHERE id = ${alert.id}`;
      }
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("POST /api/sensor-data error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
