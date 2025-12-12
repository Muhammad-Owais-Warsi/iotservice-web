import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";
import { logAudit, getIpAddress, AuditActions } from "@/app/api/utils/audit";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current user profile
    const currentUserProfile = await sql`
      SELECT id, role, company_id FROM user_profiles 
      WHERE auth_user_id = ${session.user.id}
      LIMIT 1
    `;

    if (currentUserProfile.length === 0) {
      return Response.json({ error: "Profile not found" }, { status: 404 });
    }

    const currentUser = currentUserProfile[0];

    // Only admin and manager can approve users
    if (currentUser.role !== "admin" && currentUser.role !== "manager") {
      return Response.json(
        { error: "Only admins and managers can approve users" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { userId, status } = body;

    if (!userId || !status) {
      return Response.json(
        { error: "User ID and status are required" },
        { status: 400 },
      );
    }

    if (!["approved", "suspended"].includes(status)) {
      return Response.json(
        { error: "Status must be 'approved' or 'suspended'" },
        { status: 400 },
      );
    }

    // Get the user being approved/suspended
    const targetUser = await sql`
      SELECT id, company_id, status, email, name, role 
      FROM user_profiles 
      WHERE id = ${userId}
      LIMIT 1
    `;

    if (targetUser.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const target = targetUser[0];

    // PERMISSION CHECK: Managers can only manage users in their own company
    if (currentUser.role === "manager") {
      if (target.company_id !== currentUser.company_id) {
        return Response.json(
          { error: "You can only manage users in your own company" },
          { status: 403 },
        );
      }
    }

    // Update user status
    await sql`
      UPDATE user_profiles
      SET status = ${status}
      WHERE id = ${userId}
    `;

    // Audit logging
    const ipAddress = getIpAddress(request);
    const auditAction =
      status === "approved"
        ? target.status === "suspended"
          ? AuditActions.USER_REACTIVATED
          : AuditActions.USER_APPROVED
        : AuditActions.USER_SUSPENDED;

    await logAudit({
      userId: currentUser.id,
      action: auditAction,
      entityType: "user",
      entityId: userId,
      details: {
        previousStatus: target.status,
        newStatus: status,
        targetUserEmail: target.email,
        targetUserName: target.name,
        targetUserRole: target.role,
      },
      ipAddress,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("POST /api/admin/users/approve error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
