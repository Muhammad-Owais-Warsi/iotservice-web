import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const rows = await sql`
      SELECT 
        up.id,
        up.auth_user_id,
        up.email,
        up.name,
        up.role,
        up.company_id,
        up.location_id,
        up.status,
        c.name as company_name,
        l.name as location_name
      FROM user_profiles up
      LEFT JOIN companies c ON up.company_id = c.id
      LEFT JOIN locations l ON up.location_id = l.id
      WHERE up.auth_user_id = ${userId}
      LIMIT 1
    `;

    const profile = rows?.[0] || null;
    return Response.json({ profile });
  } catch (err) {
    console.error("GET /api/profile error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { name, email } = body;

    // Validate inputs
    if (!name || !email) {
      return Response.json(
        { error: "Name and email are required" },
        { status: 400 },
      );
    }

    // Update user profile
    await sql`
      UPDATE user_profiles
      SET 
        name = ${name},
        email = ${email}
      WHERE auth_user_id = ${userId}
    `;

    // Fetch updated profile
    const rows = await sql`
      SELECT 
        up.id,
        up.auth_user_id,
        up.email,
        up.name,
        up.role,
        up.company_id,
        up.location_id,
        up.status,
        c.name as company_name,
        l.name as location_name
      FROM user_profiles up
      LEFT JOIN companies c ON up.company_id = c.id
      LEFT JOIN locations l ON up.location_id = l.id
      WHERE up.auth_user_id = ${userId}
      LIMIT 1
    `;

    const profile = rows?.[0] || null;
    return Response.json({ profile, message: "Profile updated successfully" });
  } catch (err) {
    console.error("PATCH /api/profile error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
