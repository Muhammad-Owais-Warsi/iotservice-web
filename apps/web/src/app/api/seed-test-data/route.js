import sql from "@/app/api/utils/sql";
import { hash } from "argon2";

export async function POST(request) {
  try {
    // Check if we should force recreate
    const body = await request.json().catch(() => ({}));
    const forceRecreate = body.forceRecreate === true;

    // Check if test data already exists
    const existingUsers = await sql`
      SELECT id FROM auth_users WHERE email IN ('admin@test.com', 'manager@test.com', 'employee@test.com')
    `;

    if (existingUsers.length > 0 && !forceRecreate) {
      return Response.json(
        {
          error:
            "Test accounts already exist. Use forceRecreate: true to delete and recreate them.",
          existing: existingUsers.map((u) => u.id),
        },
        { status: 400 },
      );
    }

    // If forceRecreate is true, delete existing test data
    if (forceRecreate && existingUsers.length > 0) {
      const userIds = existingUsers.map((u) => u.id);

      // Delete in correct order to respect foreign key constraints
      await sql`DELETE FROM alerts WHERE device_id IN (
        SELECT d.id FROM devices d
        JOIN locations l ON d.location_id = l.id
        JOIN companies c ON l.company_id = c.id
        WHERE c.name = 'Test Company'
      )`;

      await sql`DELETE FROM sensor_data WHERE device_id IN (
        SELECT d.id FROM devices d
        JOIN locations l ON d.location_id = l.id
        JOIN companies c ON l.company_id = c.id
        WHERE c.name = 'Test Company'
      )`;

      await sql`DELETE FROM tickets WHERE location_id IN (
        SELECT l.id FROM locations l
        JOIN companies c ON l.company_id = c.id
        WHERE c.name = 'Test Company'
      )`;

      await sql`DELETE FROM devices WHERE location_id IN (
        SELECT l.id FROM locations l
        JOIN companies c ON l.company_id = c.id
        WHERE c.name = 'Test Company'
      )`;

      await sql`DELETE FROM user_profiles WHERE email IN ('admin@test.com', 'manager@test.com', 'employee@test.com')`;

      await sql`DELETE FROM auth_accounts WHERE "userId" = ANY(${userIds})`;

      await sql`DELETE FROM auth_sessions WHERE "userId" = ANY(${userIds})`;

      await sql`DELETE FROM locations WHERE company_id IN (
        SELECT id FROM companies WHERE name = 'Test Company'
      )`;

      await sql`DELETE FROM companies WHERE name = 'Test Company'`;

      await sql`DELETE FROM auth_users WHERE id = ANY(${userIds})`;
    }

    // Create test company
    const [company] = await sql`
      INSERT INTO companies (name)
      VALUES ('Test Company')
      RETURNING id
    `;

    // Create test locations
    const [location1] = await sql`
      INSERT INTO locations (company_id, name, pincode)
      VALUES (${company.id}, 'Mumbai Office', '400001')
      RETURNING id
    `;

    const [location2] = await sql`
      INSERT INTO locations (company_id, name, pincode)
      VALUES (${company.id}, 'Delhi Office', '110001')
      RETURNING id
    `;

    // Hash password (password123 for all test accounts)
    const hashedPassword = await hash("password123");

    // Create Admin User
    const [adminAuthUser] = await sql`
      INSERT INTO auth_users (name, email, "emailVerified")
      VALUES ('Admin User', 'admin@test.com', NOW())
      RETURNING id
    `;

    await sql`
      INSERT INTO auth_accounts ("userId", type, provider, "providerAccountId", password)
      VALUES (${adminAuthUser.id}, 'credentials', 'credentials', ${adminAuthUser.id.toString()}, ${hashedPassword})
    `;

    await sql`
      INSERT INTO user_profiles (auth_user_id, email, name, role, company_id, location_id, status)
      VALUES (${adminAuthUser.id.toString()}, 'admin@test.com', 'Admin User', 'admin', ${company.id}, NULL, 'approved')
    `;

    // Create Manager User
    const [managerAuthUser] = await sql`
      INSERT INTO auth_users (name, email, "emailVerified")
      VALUES ('Manager User', 'manager@test.com', NOW())
      RETURNING id
    `;

    await sql`
      INSERT INTO auth_accounts ("userId", type, provider, "providerAccountId", password)
      VALUES (${managerAuthUser.id}, 'credentials', 'credentials', ${managerAuthUser.id.toString()}, ${hashedPassword})
    `;

    await sql`
      INSERT INTO user_profiles (auth_user_id, email, name, role, company_id, location_id, status)
      VALUES (${managerAuthUser.id.toString()}, 'manager@test.com', 'Manager User', 'manager', ${company.id}, ${location1.id}, 'approved')
    `;

    // Create Employee User
    const [employeeAuthUser] = await sql`
      INSERT INTO auth_users (name, email, "emailVerified")
      VALUES ('Employee User', 'employee@test.com', NOW())
      RETURNING id
    `;

    await sql`
      INSERT INTO auth_accounts ("userId", type, provider, "providerAccountId", password)
      VALUES (${employeeAuthUser.id}, 'credentials', 'credentials', ${employeeAuthUser.id.toString()}, ${hashedPassword})
    `;

    await sql`
      INSERT INTO user_profiles (auth_user_id, email, name, role, company_id, location_id, status)
      VALUES (${employeeAuthUser.id.toString()}, 'employee@test.com', 'Employee User', 'employee', ${company.id}, ${location2.id}, 'approved')
    `;

    // Create some test devices for the locations
    const [device1] = await sql`
      INSERT INTO devices (location_id, name, device_type, temp_threshold, humidity_threshold, status)
      VALUES (${location1.id}, 'Server Room Sensor', 'temperature', 25.0, 60.0, 'active')
      RETURNING id
    `;

    const [device2] = await sql`
      INSERT INTO devices (location_id, name, device_type, temp_threshold, humidity_threshold, status)
      VALUES (${location1.id}, 'Main Door Sensor', 'door', 30.0, 70.0, 'active')
      RETURNING id
    `;

    const [device3] = await sql`
      INSERT INTO devices (location_id, name, device_type, temp_threshold, humidity_threshold, status)
      VALUES (${location2.id}, 'Warehouse Sensor', 'temperature', 28.0, 65.0, 'active')
      RETURNING id
    `;

    // Add some sample sensor data
    await sql`
      INSERT INTO sensor_data (device_id, temperature, humidity, electricity, door_status, recorded_at)
      VALUES 
        (${device1.id}, 22.5, 55.0, 125.50, NULL, NOW() - INTERVAL '1 hour'),
        (${device1.id}, 23.1, 56.2, 130.20, NULL, NOW() - INTERVAL '30 minutes'),
        (${device1.id}, 24.2, 58.1, 128.75, NULL, NOW()),
        (${device2.id}, 26.0, 62.0, 45.30, 'closed', NOW() - INTERVAL '2 hours'),
        (${device2.id}, 26.5, 63.5, 47.80, 'closed', NOW() - INTERVAL '1 hour'),
        (${device2.id}, 27.0, 64.0, 46.20, 'open', NOW()),
        (${device3.id}, 29.5, 68.0, 210.50, NULL, NOW() - INTERVAL '3 hours'),
        (${device3.id}, 30.2, 69.5, 215.30, NULL, NOW() - INTERVAL '1.5 hours'),
        (${device3.id}, 31.0, 71.0, 220.10, NULL, NOW())
    `;

    // Create a test alert
    await sql`
      INSERT INTO alerts (device_id, location_id, alert_type, message, severity, status, condition_started_at)
      VALUES (
        ${device3.id}, 
        ${location2.id}, 
        'temperature', 
        'Temperature exceeds threshold at Warehouse Sensor', 
        'warning', 
        'active',
        NOW() - INTERVAL '30 minutes'
      )
    `;

    return Response.json({
      success: true,
      message: "Test accounts created successfully!",
      accounts: [
        {
          email: "admin@test.com",
          password: "password123",
          role: "admin",
          company: "Test Company",
          location: "All locations",
        },
        {
          email: "manager@test.com",
          password: "password123",
          role: "manager",
          company: "Test Company",
          location: "Mumbai Office",
        },
        {
          email: "employee@test.com",
          password: "password123",
          role: "employee",
          company: "Test Company",
          location: "Delhi Office",
        },
      ],
      data: {
        companyId: company.id,
        locations: [
          { id: location1.id, name: "Mumbai Office" },
          { id: location2.id, name: "Delhi Office" },
        ],
        devices: [
          { id: device1.id, name: "Server Room Sensor" },
          { id: device2.id, name: "Main Door Sensor" },
          { id: device3.id, name: "Warehouse Sensor" },
        ],
      },
    });
  } catch (error) {
    console.error("Seed test data error:", error);
    return Response.json(
      { error: "Failed to create test data", details: error.message },
      { status: 500 },
    );
  }
}
