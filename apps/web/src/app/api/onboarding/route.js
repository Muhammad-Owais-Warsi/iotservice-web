import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";
import { logAudit, AuditActions, getIpAddress } from "@/app/api/utils/audit";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, role, companyName, locationName, pincode, locationId } = body;

    // Validation
    if (!name || !role) {
      return Response.json(
        { error: "Name and role are required" },
        { status: 400 },
      );
    }

    if (!["admin", "manager", "employee"].includes(role)) {
      return Response.json({ error: "Invalid role" }, { status: 400 });
    }

    let finalCompanyId = null;
    let finalLocationId = locationId || null;

    // Handle company and location creation based on role
    if (role === "admin" || role === "manager") {
      if (!companyName) {
        return Response.json(
          { error: "Company name is required for admin and manager roles" },
          { status: 400 },
        );
      }

      // Create company
      const company = await sql`
        INSERT INTO companies (name)
        VALUES (${companyName})
        RETURNING id
      `;
      finalCompanyId = company[0].id;

      // Create location if manager
      if (role === "manager") {
        if (!locationName || !pincode) {
          return Response.json(
            {
              error: "Location name and pincode are required for manager role",
            },
            { status: 400 },
          );
        }

        const location = await sql`
          INSERT INTO locations (company_id, name, pincode)
          VALUES (${finalCompanyId}, ${locationName}, ${pincode})
          RETURNING id
        `;
        finalLocationId = location[0].id;
      }
    } else if (role === "employee") {
      if (!locationId) {
        return Response.json(
          { error: "Location is required for employee role" },
          { status: 400 },
        );
      }

      // Get company_id from location
      const location = await sql`
        SELECT company_id FROM locations WHERE id = ${locationId} LIMIT 1
      `;

      if (location.length === 0) {
        return Response.json({ error: "Invalid location" }, { status: 400 });
      }

      finalCompanyId = location[0].company_id;
    }

    // Determine initial status
    const initialStatus = role === "admin" ? "approved" : "pending";

    // Create user profile
    const userProfile = await sql`
      INSERT INTO user_profiles (auth_user_id, email, name, role, company_id, location_id, status)
      VALUES (
        ${session.user.id},
        ${session.user.email},
        ${name},
        ${role},
        ${finalCompanyId},
        ${finalLocationId},
        ${initialStatus}
      )
      RETURNING *
    `;

    // Audit log for user creation
    const ipAddress = getIpAddress(request);
    await logAudit({
      userId: userProfile[0].id,
      action: AuditActions.USER_CREATED,
      entityType: "user",
      entityId: userProfile[0].id,
      details: {
        email: session.user.email,
        name,
        role,
        companyId: finalCompanyId,
        locationId: finalLocationId,
        initialStatus,
      },
      ipAddress,
    });

    return Response.json({ success: true, profile: userProfile[0] });
  } catch (error) {
    console.error("POST /api/onboarding error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
