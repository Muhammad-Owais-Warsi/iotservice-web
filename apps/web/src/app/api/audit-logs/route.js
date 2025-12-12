import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
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

    if (currentUserProfile.length === 0) {
      return Response.json({ error: "Profile not found" }, { status: 404 });
    }

    const currentUser = currentUserProfile[0];

    // Only admin and manager can view audit logs
    if (currentUser.role === "employee") {
      return Response.json(
        { error: "Only admins and managers can view audit logs" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");

    let logs = [];

    if (currentUser.role === "admin") {
      // Admin sees all logs
      logs = await sql`
        SELECT 
          al.*,
          up.name as user_name,
          up.email as user_email,
          up.role as user_role
        FROM audit_logs al
        LEFT JOIN user_profiles up ON al.user_id = up.id
        ORDER BY al.created_at DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `;
    } else if (currentUser.role === "manager") {
      // Manager sees logs for users in their company
      logs = await sql`
        SELECT 
          al.*,
          up.name as user_name,
          up.email as user_email,
          up.role as user_role
        FROM audit_logs al
        LEFT JOIN user_profiles up ON al.user_id = up.id
        WHERE up.company_id = ${currentUser.company_id}
        ORDER BY al.created_at DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `;
    }

    return Response.json({ logs });
  } catch (error) {
    console.error("GET /api/audit-logs error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
