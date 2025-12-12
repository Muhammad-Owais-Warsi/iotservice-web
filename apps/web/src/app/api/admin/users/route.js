import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current user profile
    const currentUserProfile = await sql`
      SELECT role, company_id FROM user_profiles 
      WHERE auth_user_id = ${session.user.id}
      LIMIT 1
    `;

    if (
      currentUserProfile.length === 0 ||
      currentUserProfile[0].role === "employee"
    ) {
      return Response.json(
        { error: "Only admins and managers can view users" },
        { status: 403 },
      );
    }

    const currentUser = currentUserProfile[0];
    let users = [];

    if (currentUser.role === "admin") {
      // Admin sees all users
      users = await sql`
        SELECT 
          up.*,
          c.name as company_name,
          l.name as location_name
        FROM user_profiles up
        LEFT JOIN companies c ON up.company_id = c.id
        LEFT JOIN locations l ON up.location_id = l.id
        ORDER BY up.created_at DESC
      `;
    } else if (currentUser.role === "manager") {
      // Manager sees only users in their company
      users = await sql`
        SELECT 
          up.*,
          c.name as company_name,
          l.name as location_name
        FROM user_profiles up
        LEFT JOIN companies c ON up.company_id = c.id
        LEFT JOIN locations l ON up.location_id = l.id
        WHERE up.company_id = ${currentUser.company_id}
        ORDER BY up.created_at DESC
      `;
    }

    return Response.json({ users });
  } catch (error) {
    console.error("GET /api/admin/users error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
