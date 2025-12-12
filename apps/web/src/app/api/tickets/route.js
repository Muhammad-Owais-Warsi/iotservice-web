import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userProfile = await sql`
      SELECT id, role, company_id, location_id FROM user_profiles 
      WHERE auth_user_id = ${session.user.id}
      LIMIT 1
    `;

    if (userProfile.length === 0) {
      return Response.json({ tickets: [] });
    }

    const profile = userProfile[0];
    let tickets = [];

    if (profile.role === "admin") {
      tickets = await sql`
        SELECT 
          t.*,
          l.name as location_name,
          d.name as device_name,
          up.name as created_by_name
        FROM tickets t
        JOIN locations l ON t.location_id = l.id
        JOIN devices d ON t.device_id = d.id
        JOIN user_profiles up ON t.created_by = up.id
        ORDER BY t.created_at DESC
      `;
    } else if (profile.role === "manager") {
      tickets = await sql`
        SELECT 
          t.*,
          l.name as location_name,
          d.name as device_name,
          up.name as created_by_name
        FROM tickets t
        JOIN locations l ON t.location_id = l.id
        JOIN devices d ON t.device_id = d.id
        JOIN user_profiles up ON t.created_by = up.id
        WHERE l.company_id = ${profile.company_id}
        ORDER BY t.created_at DESC
      `;
    } else if (profile.role === "employee") {
      if (profile.location_id) {
        tickets = await sql`
          SELECT 
            t.*,
            l.name as location_name,
            d.name as device_name,
            up.name as created_by_name
          FROM tickets t
          JOIN locations l ON t.location_id = l.id
          JOIN devices d ON t.device_id = d.id
          JOIN user_profiles up ON t.created_by = up.id
          WHERE t.location_id = ${profile.location_id}
          ORDER BY t.created_at DESC
        `;
      }
    }

    return Response.json({ tickets });
  } catch (error) {
    console.error("GET /api/tickets error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userProfile = await sql`
      SELECT id, role FROM user_profiles 
      WHERE auth_user_id = ${session.user.id}
      LIMIT 1
    `;

    if (
      userProfile.length === 0 ||
      !["manager", "employee"].includes(userProfile[0].role)
    ) {
      return Response.json(
        { error: "Only managers and employees can create tickets" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { locationId, deviceId, problem, visitDate } = body;

    if (!locationId || !deviceId || !problem || !visitDate) {
      return Response.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    const newTicket = await sql`
      INSERT INTO tickets (location_id, device_id, created_by, problem, visit_date)
      VALUES (${locationId}, ${deviceId}, ${userProfile[0].id}, ${problem}, ${visitDate})
      RETURNING *
    `;

    return Response.json({ ticket: newTicket[0] });
  } catch (error) {
    console.error("POST /api/tickets error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
