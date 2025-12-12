import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user profile
    const userProfile = await sql`
      SELECT role, company_id, location_id FROM user_profiles 
      WHERE auth_user_id = ${session.user.id}
      LIMIT 1
    `;

    if (userProfile.length === 0) {
      return Response.json({ alerts: [] });
    }

    const profile = userProfile[0];
    const now = new Date().toISOString();
    let alerts = [];

    if (profile.role === "admin") {
      // Admin sees all alerts (excluding snoozed ones)
      alerts = await sql`
        SELECT 
          a.*,
          l.name as location_name,
          d.name as device_name
        FROM alerts a
        JOIN locations l ON a.location_id = l.id
        JOIN devices d ON a.device_id = d.id
        WHERE a.snoozed_until IS NULL OR a.snoozed_until < ${now}
        ORDER BY a.created_at DESC
      `;
    } else if (profile.role === "manager") {
      // Manager sees alerts for their company (excluding snoozed ones)
      alerts = await sql`
        SELECT 
          a.*,
          l.name as location_name,
          d.name as device_name
        FROM alerts a
        JOIN locations l ON a.location_id = l.id
        JOIN devices d ON a.device_id = d.id
        WHERE l.company_id = ${profile.company_id}
        AND (a.snoozed_until IS NULL OR a.snoozed_until < ${now})
        ORDER BY a.created_at DESC
      `;
    } else if (profile.role === "employee") {
      // Employee sees alerts for their location (excluding snoozed ones)
      if (profile.location_id) {
        alerts = await sql`
          SELECT 
            a.*,
            l.name as location_name,
            d.name as device_name
          FROM alerts a
          JOIN locations l ON a.location_id = l.id
          JOIN devices d ON a.device_id = d.id
          WHERE a.location_id = ${profile.location_id}
          AND (a.snoozed_until IS NULL OR a.snoozed_until < ${now})
          ORDER BY a.created_at DESC
        `;
      }
    }

    return Response.json({ alerts });
  } catch (error) {
    console.error("GET /api/alerts error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
