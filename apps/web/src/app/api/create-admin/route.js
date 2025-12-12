import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function POST() {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has a profile
    const userProfile = await sql`
      SELECT id, role, status FROM user_profiles 
      WHERE auth_user_id = ${session.user.id}
      LIMIT 1
    `;

    if (userProfile.length === 0) {
      // Create admin profile if no profile exists
      const newAdmin = await sql`
        INSERT INTO user_profiles (auth_user_id, email, name, role, status)
        VALUES (${session.user.id}, ${session.user.email}, ${session.user.name || "Admin"}, 'admin', 'approved')
        RETURNING *
      `;

      return Response.json({
        success: true,
        message:
          "You have been promoted to admin. This is your first admin account. Please delete the /create-admin route for security.",
      });
    } else if (userProfile[0].role !== "admin") {
      // Promote existing user to admin
      await sql`
        UPDATE user_profiles 
        SET role = 'admin', status = 'approved'
        WHERE auth_user_id = ${session.user.id}
      `;

      return Response.json({
        success: true,
        message:
          "You have been promoted to admin. Please delete the /create-admin route for security.",
      });
    } else {
      return Response.json(
        {
          error:
            "You are already an admin. Please delete the /create-admin route for security.",
        },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("POST /api/create-admin error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
