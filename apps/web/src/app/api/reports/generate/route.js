import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function POST(req) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { locationId, deviceId, days } = body;

    if (!days || ![7, 30, 90].includes(days)) {
      return Response.json(
        { error: "Invalid days parameter. Must be 7, 30, or 90." },
        { status: 400 },
      );
    }

    // Get user profile to check permissions
    const [userProfile] = await sql`
      SELECT role, location_id, company_id 
      FROM user_profiles 
      WHERE auth_user_id = ${session.user.id}
    `;

    if (
      !userProfile ||
      !["admin", "manager", "employee"].includes(userProfile.role)
    ) {
      return Response.json(
        { error: "Insufficient permissions" },
        { status: 403 },
      );
    }

    // Get location details
    let locationFilter = "";
    let params = [days * 24];

    if (locationId) {
      locationFilter = "AND l.id = $2";
      params.push(locationId);
    } else if (userProfile.role !== "admin") {
      // Non-admins can only see their assigned location
      locationFilter = "AND l.id = $2";
      params.push(userProfile.location_id);
    }

    // Fetch location and company info
    const locationQuery = `
      SELECT l.id, l.name as location_name, l.pincode, c.name as company_name
      FROM locations l
      JOIN companies c ON l.company_id = c.id
      WHERE 1=1 ${locationFilter}
    `;

    const locations = await sql(locationQuery, params.slice(1));

    if (!locations || locations.length === 0) {
      return Response.json({ error: "Location not found" }, { status: 404 });
    }

    const location = locations[0];

    // Get devices for this location
    let deviceFilter = "";
    let deviceParams = [location.id];

    if (deviceId) {
      deviceFilter = "AND id = $2";
      deviceParams.push(deviceId);
    }

    const devicesQuery = `
      SELECT id, name, device_type, temp_threshold, humidity_threshold
      FROM devices
      WHERE location_id = $1 ${deviceFilter} AND status = 'active'
    `;

    const devices = await sql(devicesQuery, deviceParams);

    if (!devices || devices.length === 0) {
      return Response.json({ error: "No devices found" }, { status: 404 });
    }

    // Fetch sensor data for all devices
    const sensorDataPromises = devices.map(async (device) => {
      const data = await sql`
        SELECT temperature, humidity, electricity, door_status, recorded_at
        FROM sensor_data
        WHERE device_id = ${device.id}
          AND recorded_at >= NOW() - INTERVAL '1 hour' * ${days * 24}
        ORDER BY recorded_at DESC
      `;
      return { device, readings: data };
    });

    const allDeviceData = await Promise.all(sensorDataPromises);

    // Calculate statistics for each device
    const deviceStats = allDeviceData.map(({ device, readings }) => {
      const temps = readings
        .filter((r) => r.temperature !== null)
        .map((r) => parseFloat(r.temperature));
      const humidities = readings
        .filter((r) => r.humidity !== null)
        .map((r) => parseFloat(r.humidity));
      const electricity = readings
        .filter((r) => r.electricity !== null)
        .map((r) => parseFloat(r.electricity));

      return {
        name: device.name,
        type: device.device_type,
        totalReadings: readings.length,
        temperature: {
          avg:
            temps.length > 0
              ? (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(2)
              : "N/A",
          min: temps.length > 0 ? Math.min(...temps).toFixed(2) : "N/A",
          max: temps.length > 0 ? Math.max(...temps).toFixed(2) : "N/A",
          threshold: device.temp_threshold || "N/A",
        },
        humidity: {
          avg:
            humidities.length > 0
              ? (
                  humidities.reduce((a, b) => a + b, 0) / humidities.length
                ).toFixed(2)
              : "N/A",
          min:
            humidities.length > 0 ? Math.min(...humidities).toFixed(2) : "N/A",
          max:
            humidities.length > 0 ? Math.max(...humidities).toFixed(2) : "N/A",
          threshold: device.humidity_threshold || "N/A",
        },
        electricity: {
          total:
            electricity.length > 0
              ? electricity.reduce((a, b) => a + b, 0).toFixed(2)
              : "N/A",
          avg:
            electricity.length > 0
              ? (
                  electricity.reduce((a, b) => a + b, 0) / electricity.length
                ).toFixed(2)
              : "N/A",
        },
      };
    });

    // Generate HTML for PDF
    const reportDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sensor Report - ${days} Days</title>
      </head>
      <body>
        <div style="font-family: Arial, sans-serif; padding: 40px; max-width: 900px; margin: 0 auto;">
          <!-- Header -->
          <div style="border-bottom: 3px solid #4F8BFF; padding-bottom: 20px; margin-bottom: 30px;">
            <h1 style="color: #1E1E1E; margin: 0 0 10px 0; font-size: 28px;">Facility Monitoring Report</h1>
            <p style="color: #666; margin: 5px 0; font-size: 14px;">
              <strong>Company:</strong> ${location.company_name}<br>
              <strong>Location:</strong> ${location.location_name}<br>
              <strong>Pincode:</strong> ${location.pincode}<br>
              <strong>Report Period:</strong> Last ${days} Days<br>
              <strong>Generated:</strong> ${reportDate}
            </p>
          </div>

          <!-- Summary -->
          <div style="background-color: #F5F9FF; border-left: 4px solid #4F8BFF; padding: 20px; margin-bottom: 30px;">
            <h2 style="color: #1E1E1E; margin: 0 0 15px 0; font-size: 20px;">Report Summary</h2>
            <p style="margin: 5px 0; color: #333;">
              <strong>Total Devices Monitored:</strong> ${devices.length}<br>
              <strong>Total Sensor Readings:</strong> ${deviceStats.reduce((sum, d) => sum + d.totalReadings, 0)}
            </p>
          </div>

          <!-- Device Statistics -->
          <h2 style="color: #1E1E1E; margin: 30px 0 20px 0; font-size: 22px;">Device Statistics</h2>
          
          ${deviceStats
            .map(
              (device, idx) => `
            <div style="background-color: #fff; border: 1px solid #E0E0E0; border-radius: 8px; padding: 20px; margin-bottom: 20px; page-break-inside: avoid;">
              <h3 style="color: #4F8BFF; margin: 0 0 15px 0; font-size: 18px; border-bottom: 2px solid #E0E0E0; padding-bottom: 10px;">
                ${idx + 1}. ${device.name} 
                <span style="color: #666; font-size: 14px; font-weight: normal;">(${device.type})</span>
              </h3>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px;">
                <!-- Temperature -->
                <div>
                  <h4 style="color: #FF6B6B; margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Temperature</h4>
                  <table style="width: 100%; font-size: 13px; color: #333;">
                    <tr><td style="padding: 4px 0;"><strong>Average:</strong></td><td>${device.temperature.avg}°C</td></tr>
                    <tr><td style="padding: 4px 0;"><strong>Min:</strong></td><td>${device.temperature.min}°C</td></tr>
                    <tr><td style="padding: 4px 0;"><strong>Max:</strong></td><td>${device.temperature.max}°C</td></tr>
                    <tr><td style="padding: 4px 0;"><strong>Threshold:</strong></td><td>${device.temperature.threshold}°C</td></tr>
                  </table>
                </div>

                <!-- Humidity -->
                <div>
                  <h4 style="color: #5B94FF; margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Humidity</h4>
                  <table style="width: 100%; font-size: 13px; color: #333;">
                    <tr><td style="padding: 4px 0;"><strong>Average:</strong></td><td>${device.humidity.avg}%</td></tr>
                    <tr><td style="padding: 4px 0;"><strong>Min:</strong></td><td>${device.humidity.min}%</td></tr>
                    <tr><td style="padding: 4px 0;"><strong>Max:</strong></td><td>${device.humidity.max}%</td></tr>
                    <tr><td style="padding: 4px 0;"><strong>Threshold:</strong></td><td>${device.humidity.threshold}%</td></tr>
                  </table>
                </div>

                <!-- Electricity -->
                <div>
                  <h4 style="color: #FFAA00; margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Electricity</h4>
                  <table style="width: 100%; font-size: 13px; color: #333;">
                    <tr><td style="padding: 4px 0;"><strong>Total:</strong></td><td>${device.electricity.total} kWh</td></tr>
                    <tr><td style="padding: 4px 0;"><strong>Average:</strong></td><td>${device.electricity.avg} kWh</td></tr>
                    <tr><td style="padding: 4px 0;"><strong>Readings:</strong></td><td>${device.totalReadings}</td></tr>
                  </table>
                </div>
              </div>
            </div>
          `,
            )
            .join("")}

          <!-- Footer -->
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #E0E0E0; text-align: center; color: #999; font-size: 12px;">
            <p>This report was automatically generated by the Facility Monitoring System</p>
            <p>© ${new Date().getFullYear()} - Confidential</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Generate PDF using the integration
    const pdfResponse = await fetch(
      `${process.env.APP_URL}/integrations/pdf-generation/pdf`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source: { html },
        }),
      },
    );

    if (!pdfResponse.ok) {
      throw new Error("Failed to generate PDF");
    }

    const pdfBuffer = await pdfResponse.arrayBuffer();

    // Return PDF as downloadable file
    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="sensor-report-${days}days-${Date.now()}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Report generation error:", error);
    return Response.json(
      { error: "Failed to generate report" },
      { status: 500 },
    );
  }
}
