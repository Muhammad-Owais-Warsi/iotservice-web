import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";
import { logAudit } from "@/app/api/utils/audit";

export async function PUT(request, { params }) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(params.id);
    const body = await request.json();
    const { name, email, role, company_id, location_id } = body;

    // Get current user profile
    const currentUserProfile = await sql`
      SELECT id, role, company_id FROM user_profiles 
      WHERE auth_user_id = ${session.user.id}
      LIMIT 1
    `;

    if (
      currentUserProfile.length === 0 ||
      currentUserProfile[0].role === "employee"
    ) {
      return Response.json(
        { error: "Only admins and managers can update users" },
        { status: 403 },
      );
    }

    const currentUser = currentUserProfile[0];

    // Get the user being updated
    const targetUser = await sql`
      SELECT * FROM user_profiles WHERE id = ${userId} LIMIT 1
    `;

    if (targetUser.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // If manager, can only update users in their company
    if (currentUser.role === "manager") {
      if (targetUser[0].company_id !== currentUser.company_id) {
        return Response.json(
          { error: "Cannot update users from other companies" },
          { status: 403 },
        );
      }
      // Managers cannot change company_id
      if (company_id && company_id !== currentUser.company_id) {
        return Response.json(
          { error: "Managers cannot move users to other companies" },
          { status: 403 },
        );
      }
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount}`);
      values.push(name);
      paramCount++;
    }

    if (email !== undefined) {
      updates.push(`email = $${paramCount}`);
      values.push(email);
      paramCount++;
    }

    if (role !== undefined) {
      updates.push(`role = $${paramCount}`);
      values.push(role);
      paramCount++;
    }

    if (company_id !== undefined) {
      updates.push(`company_id = $${paramCount}`);
      values.push(company_id);
      paramCount++;
    }

    if (location_id !== undefined) {
      updates.push(`location_id = $${paramCount}`);
      values.push(location_id);
      paramCount++;
    }

    if (updates.length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    // Add userId to values array
    values.push(userId);

    // Execute update
    const updateQuery = `
      UPDATE user_profiles 
      SET ${updates.join(", ")}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await sql(updateQuery, values);

    // Log the audit
    await logAudit({
      userId: currentUser.id,
      action: "update_user",
      entityType: "user_profile",
      entityId: userId,
      details: { updates: body },
    });

    return Response.json({ user: result[0] });
  } catch (error) {
    console.error("PUT /api/admin/users/[id] error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
