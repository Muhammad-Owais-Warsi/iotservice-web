import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { alertId } = body;

    if (!alertId) {
      return Response.json({ error: "Alert ID is required" }, { status: 400 });
    }

    // Snooze for 30 minutes
    const snoozeUntil = new Date(Date.now() + 30 * 60 * 1000);

    await sql`
      UPDATE alerts 
      SET snoozed_until = ${snoozeUntil.toISOString()}
      WHERE id = ${alertId}
    `;

    return Response.json({
      success: true,
      snoozed_until: snoozeUntil.toISOString(),
    });
  } catch (error) {
    console.error("POST /api/alerts/snooze error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
