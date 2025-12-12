import sql from "@/app/api/utils/sql";

/**
 * Log user actions to audit trail
 * @param {Object} params
 * @param {number} params.userId - User profile ID (not auth user ID)
 * @param {string} params.action - Action performed (e.g., 'USER_APPROVED', 'LOCATION_CREATED')
 * @param {string} params.entityType - Type of entity (e.g., 'user', 'location', 'device')
 * @param {number} params.entityId - ID of the entity
 * @param {Object} params.details - Additional details as JSON
 * @param {string} params.ipAddress - IP address of the user
 */
export async function logAudit({
  userId,
  action,
  entityType,
  entityId,
  details = {},
  ipAddress = null,
}) {
  try {
    await sql`
      INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address)
      VALUES (${userId}, ${action}, ${entityType}, ${entityId || null}, ${JSON.stringify(details)}, ${ipAddress})
    `;
  } catch (error) {
    // Don't throw - audit logging should not break the main flow
    console.error("Audit log error:", error);
  }
}

/**
 * Get user profile ID from auth user ID
 */
export async function getUserProfileId(authUserId) {
  const result = await sql`
    SELECT id FROM user_profiles WHERE auth_user_id = ${authUserId} LIMIT 1
  `;
  return result[0]?.id || null;
}

/**
 * Extract IP address from request
 */
export function getIpAddress(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  return realIp || "unknown";
}

// Audit action constants
export const AuditActions = {
  // User actions
  USER_CREATED: "USER_CREATED",
  USER_APPROVED: "USER_APPROVED",
  USER_SUSPENDED: "USER_SUSPENDED",
  USER_REACTIVATED: "USER_REACTIVATED",
  USER_UPDATED: "USER_UPDATED",
  USER_LOGIN: "USER_LOGIN",
  USER_LOGOUT: "USER_LOGOUT",

  // Location actions
  LOCATION_CREATED: "LOCATION_CREATED",
  LOCATION_UPDATED: "LOCATION_UPDATED",
  LOCATION_DELETED: "LOCATION_DELETED",

  // Device actions
  DEVICE_CREATED: "DEVICE_CREATED",
  DEVICE_UPDATED: "DEVICE_UPDATED",
  DEVICE_DELETED: "DEVICE_DELETED",

  // Alert actions
  ALERT_CREATED: "ALERT_CREATED",
  ALERT_SNOOZED: "ALERT_SNOOZED",
  ALERT_ACKNOWLEDGED: "ALERT_ACKNOWLEDGED",
  ALERT_RESOLVED: "ALERT_RESOLVED",

  // Ticket actions
  TICKET_CREATED: "TICKET_CREATED",
  TICKET_UPDATED: "TICKET_UPDATED",
  TICKET_COMPLETED: "TICKET_COMPLETED",
};
