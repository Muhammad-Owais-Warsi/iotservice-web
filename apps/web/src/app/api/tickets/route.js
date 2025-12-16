import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userProfile = await sql`
      SELECT id, role, company_id, location_id FROM user_profiles 
      WHERE auth_user_id = ${session.user.id}
      LIMIT 1
    `;

    if (userProfile.length === 0) {
      return Response.json({ tickets: [] });
    }

    const profile = userProfile[0];
    let tickets = [];

    if (profile.role === "admin") {
      tickets = await sql`
        SELECT 
          t.*,
          l.name as location_name,
          d.name as device_name,
          up.name as created_by_name
        FROM tickets t
        LEFT JOIN locations l ON t.location_id = l.id
        LEFT JOIN devices d ON t.device_id = d.id
        LEFT JOIN user_profiles up ON t.created_by = up.id
        ORDER BY t.created_at DESC
      `;
    } else if (profile.role === "master") {
      tickets = await sql`
        SELECT 
          t.*,
          l.name as location_name,
          d.name as device_name,
          up.name as created_by_name
        FROM tickets t
        LEFT JOIN locations l ON t.location_id = l.id
        LEFT JOIN devices d ON t.device_id = d.id
        LEFT JOIN user_profiles up ON t.created_by = up.id
        WHERE l.company_id = ${profile.company_id}
        ORDER BY t.created_at DESC
      `;
    } else if (profile.role === "employee") {
      if (profile.location_id) {
        tickets = await sql`
          SELECT 
            t.*,
            l.name as location_name,
            d.name as device_name,
            up.name as created_by_name
          FROM tickets t
          LEFT JOIN locations l ON t.location_id = l.id
          LEFT JOIN devices d ON t.device_id = d.id
          LEFT JOIN user_profiles up ON t.created_by = up.id
          WHERE t.location_id = ${profile.location_id}
          ORDER BY t.created_at DESC
        `;
      }
    }

    return Response.json({ tickets });
  } catch (error) {
    console.error("GET /api/tickets error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Fetch the user's profile to check permissions
    const userProfile = await sql`
      SELECT id, role, company_id, location_id FROM user_profiles 
      WHERE auth_user_id = ${session.user.id}
      LIMIT 1
    `;

    // 2. Security Check: Only Managers (Master) and Employees can create tickets
    if (
      userProfile.length === 0 ||
      !["master", "employee"].includes(userProfile[0].role)
    ) {
      return Response.json(
        { error: "Only masters and employees can create tickets" },
        { status: 403 },
      );
    }

    const body = await request.json();

    // 3. Extract all the new fields from the request body
    const {
      // Basic Info
      company_name,
      company_phone,
      company_email,
      brand_name,
      years_of_operation,

      // Billing
      gst,
      billing_address,

      // Location & Time
      locationId, // We still use ID for the system linkage
      location_string, // Optional string override if provided
      visitDate,
      visitTime, // Can be merged into visitDate

      // Equipment
      equipment_type,
      equipment_Slno,
      capacity,
      photo_of_specification_plate,

      // Issue
      problem_stat, // problem_statement
      photos, // Array of strings (URLs)

      // POC (Point of Contact)
      poc_name,
      poc_phno,
      poc_email
    } = body;

    // 4. Validation (Basic)
    if (!locationId || !problem_stat || !visitDate) {
      return Response.json(
        { error: "Location, Problem, and Date are required fields." },
        { status: 400 },
      );
    }

    // Merge Date and Time if needed, or just use visitDate as ISO string
    const finalVisitDate = visitDate;

    // 5. Insert into Database
    // We map the JavaScript variable names to the SQL Column names we defined in supabase_schema.sql
    const newTicket = await sql`
      INSERT INTO tickets (
        created_by,
        location_id,
        
        company_name,
        company_phone,
        company_email,
        brand_name,
        years_of_operation,
        
        gst_number,
        billing_address,
        
        equipment_type,
        equipment_serial_no,
        capacity,
        
        visit_date,
        
        problem_statement,
        photos,
        photo_spec_plate,
        
        poc_name,
        poc_phone,
        poc_email
      )
      VALUES (
        ${userProfile[0].id},
        ${locationId},
        
        ${company_name},
        ${company_phone},
        ${company_email},
        ${brand_name},
        ${years_of_operation},
        
        ${gst},
        ${billing_address},
        
        ${equipment_type},
        ${equipment_Slno},
        ${capacity},
        
        ${finalVisitDate},
        
        ${problem_stat},
        ${photos || []}, -- Default to empty array if null
        ${photo_of_specification_plate},
        
        ${poc_name},
        ${poc_phno},
        ${poc_email}
      )
      RETURNING *
    `;

    return Response.json({ ticket: newTicket[0] });
  } catch (error) {
    console.error("POST /api/tickets error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
