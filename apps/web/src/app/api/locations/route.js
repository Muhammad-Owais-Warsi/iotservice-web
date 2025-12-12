import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";
import { logAudit, AuditActions, getIpAddress } from "@/app/api/utils/audit";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get locationId from URL query if specified
    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get("locationId");

    // Get user profile
    const userProfile = await sql`
      SELECT role, company_id, location_id FROM user_profiles 
      WHERE auth_user_id = ${session.user.id}
      LIMIT 1
    `;

    if (userProfile.length === 0) {
      return Response.json({ locations: [] });
    }

    const profile = userProfile[0];
    let locations = [];

    // If specific location requested, fetch only that one (with permission check)
    if (locationId) {
      if (profile.role === "admin") {
        locations = await sql`
          SELECT 
            l.*,
            c.name as company_name,
            COUNT(DISTINCT d.id) as device_count
          FROM locations l
          LEFT JOIN companies c ON l.company_id = c.id
          LEFT JOIN devices d ON d.location_id = l.id
          WHERE l.id = ${locationId}
          GROUP BY l.id, c.name
        `;
      } else if (profile.role === "manager") {
        locations = await sql`
          SELECT 
            l.*,
            c.name as company_name,
            COUNT(DISTINCT d.id) as device_count
          FROM locations l
          LEFT JOIN companies c ON l.company_id = c.id
          LEFT JOIN devices d ON d.location_id = l.id
          WHERE l.id = ${locationId} AND l.company_id = ${profile.company_id}
          GROUP BY l.id, c.name
        `;
      } else if (profile.role === "employee") {
        locations = await sql`
          SELECT 
            l.*,
            c.name as company_name,
            COUNT(DISTINCT d.id) as device_count
          FROM locations l
          LEFT JOIN companies c ON l.company_id = c.id
          LEFT JOIN devices d ON d.location_id = l.id
          WHERE l.id = ${locationId} AND l.id = ${profile.location_id}
          GROUP BY l.id, c.name
        `;
      }
      return Response.json({ locations });
    }

    // Otherwise, fetch all locations based on role
    if (profile.role === "admin") {
      // Admin sees all locations
      locations = await sql`
        SELECT 
          l.*,
          c.name as company_name,
          COUNT(DISTINCT d.id) as device_count
        FROM locations l
        LEFT JOIN companies c ON l.company_id = c.id
        LEFT JOIN devices d ON d.location_id = l.id
        GROUP BY l.id, c.name
        ORDER BY l.name
      `;
    } else if (profile.role === "manager") {
      // Manager sees all locations in their company
      locations = await sql`
        SELECT 
          l.*,
          c.name as company_name,
          COUNT(DISTINCT d.id) as device_count
        FROM locations l
        LEFT JOIN companies c ON l.company_id = c.id
        LEFT JOIN devices d ON d.location_id = l.id
        WHERE l.company_id = ${profile.company_id}
        GROUP BY l.id, c.name
        ORDER BY l.name
      `;
    } else if (profile.role === "employee") {
      // Employee sees only their assigned location
      if (profile.location_id) {
        locations = await sql`
          SELECT 
            l.*,
            c.name as company_name,
            COUNT(DISTINCT d.id) as device_count
          FROM locations l
          LEFT JOIN companies c ON l.company_id = c.id
          LEFT JOIN devices d ON d.location_id = l.id
          WHERE l.id = ${profile.location_id}
          GROUP BY l.id, c.name
        `;
      }
    }

    return Response.json({ locations });
  } catch (error) {
    console.error("GET /api/locations error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user profile
    const userProfile = await sql`
      SELECT id, role, company_id FROM user_profiles 
      WHERE auth_user_id = ${session.user.id}
      LIMIT 1
    `;

    if (userProfile.length === 0 || userProfile[0].role !== "manager") {
      return Response.json(
        { error: "Only managers can create locations" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { name, pincode } = body;

    if (!name || !pincode) {
      return Response.json(
        { error: "Name and pincode are required" },
        { status: 400 },
      );
    }

    const newLocation = await sql`
      INSERT INTO locations (company_id, name, pincode)
      VALUES (${userProfile[0].company_id}, ${name}, ${pincode})
      RETURNING *
    `;

    // Audit log
    const ipAddress = getIpAddress(request);
    await logAudit({
      userId: userProfile[0].id,
      action: AuditActions.LOCATION_CREATED,
      entityType: "location",
      entityId: newLocation[0].id,
      details: {
        locationName: name,
        pincode,
        companyId: userProfile[0].company_id,
      },
      ipAddress,
    });

    return Response.json({ location: newLocation[0] });
  } catch (error) {
    console.error("POST /api/locations error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
