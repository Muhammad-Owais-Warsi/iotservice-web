import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const companies = await sql`
      SELECT id, name FROM companies ORDER BY name ASC
    `;

    return Response.json({ companies });
  } catch (error) {
    console.error("GET /api/companies error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
