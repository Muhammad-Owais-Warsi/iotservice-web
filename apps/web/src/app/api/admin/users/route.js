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
        { error: "Only admins and masters can view users" },
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
    } else if (currentUser.role === "master") {
      // Master sees only users in their company
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

export async function POST(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserProfile = await sql`
      SELECT id, role, company_id FROM user_profiles 
      WHERE auth_user_id = ${session.user.id}
      LIMIT 1
    `;

    if (currentUserProfile.length === 0) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const currentUser = currentUserProfile[0];

    const body = await request.json();
    const { name, email, role, company_id, location_id } = body;

    // Permissions Logic
    if (currentUser.role === 'admin') {
      // Admin can create Master accounts
      if (role !== 'master') {
        // Admin could create employees too, but prompt says "Master creates Employee".
        // "Only the Admin can create Master accounts."
      }
    } else if (currentUser.role === 'master') {
      // Master creates Employee accounts
      if (role !== 'employee') {
        return Response.json({ error: "Masters can only create Employee accounts." }, { status: 403 });
      }
      // Force company_id to be Master's company
      if (body.company_id && body.company_id !== currentUser.company_id) {
        return Response.json({ error: "Cannot create user for another company." }, { status: 403 });
      }
    } else {
      return Response.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Create the User Profile
    // Note: This creates the *Profile* in our DB. The user still needs to Sign Up via Auth provider (or we invite them).
    // For this flow, we assume we pre-create the profile and when they login, they get linked or it's just a record for now.
    // Or we rely on "Pending" status.

    // We enforce the company_id for Master's creations
    const finalCompanyId = currentUser.role === 'master' ? currentUser.company_id : company_id;

    const newUser = await sql`
      INSERT INTO user_profiles (name, email, role, company_id, location_id, status)
      VALUES (${name}, ${email}, ${role}, ${finalCompanyId}, ${location_id}, 'approved')
      RETURNING *
    `;

    return Response.json({ user: newUser[0] });

  } catch (error) {
    console.error("POST /api/admin/users error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
