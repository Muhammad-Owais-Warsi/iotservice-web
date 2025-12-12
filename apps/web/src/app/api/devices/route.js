import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get("locationId");

    if (!locationId) {
      return Response.json(
        { error: "Location ID is required" },
        { status: 400 },
      );
    }

    const devices = await sql`
      SELECT * FROM devices 
      WHERE location_id = ${locationId}
      ORDER BY name
    `;

    return Response.json({ devices });
  } catch (error) {
    console.error("GET /api/devices error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
