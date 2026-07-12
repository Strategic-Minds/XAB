import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Comprehensive Audit Logging
 * Tracks all user actions for security and compliance
 */

export type AuditAction =
  | "CREATE"
  | "READ"
  | "UPDATE"
  | "DELETE"
  | "EXPORT"
  | "IMPORT"
  | "LOGIN"
  | "LOGOUT"
  | "AUTH_FAIL"
  | "PERMISSION_DENIED"
  | "RATE_LIMIT_EXCEEDED"
  | "ERROR";

export interface AuditLog {
  id?: string;
  userId: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  status: "success" | "failure";
  statusCode?: number;
  ipAddress?: string;
  userAgent?: string;
  timestamp?: string;
}

/**
 * Extract request metadata
 */
export function getRequestMetadata(req: NextRequest) {
  return {
    ipAddress: req.headers.get("x-forwarded-for") || "unknown",
    userAgent: req.headers.get("user-agent") || "unknown",
  };
}

/**
 * Log an action to the audit trail
 */
export async function logAudit(
  log: AuditLog
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const auditEntry = {
      user_id: log.userId,
      action: log.action,
      resource: log.resource,
      resource_id: log.resourceId,
      details: log.details || {},
      status: log.status,
      status_code: log.statusCode,
      ip_address: log.ipAddress,
      user_agent: log.userAgent,
      created_at: log.timestamp || new Date().toISOString(),
    };

    const { error } = await supabase
      .from("audit_logs")
      .insert([auditEntry]);

    if (error) {
      console.error("[Audit] Error logging:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("[Audit] Exception:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Log successful action
 */
export async function logSuccess(
  userId: string,
  action: AuditAction,
  resource: string,
  resourceId?: string,
  details?: Record<string, any>,
  metadata?: { ipAddress?: string; userAgent?: string }
) {
  return logAudit({
    userId,
    action,
    resource,
    resourceId,
    details,
    status: "success",
    ipAddress: metadata?.ipAddress,
    userAgent: metadata?.userAgent,
  });
}

/**
 * Log failed action
 */
export async function logFailure(
  userId: string,
  action: AuditAction,
  resource: string,
  resourceId?: string,
  statusCode?: number,
  metadata?: { ipAddress?: string; userAgent?: string }
) {
  return logAudit({
    userId,
    action,
    resource,
    resourceId,
    status: "failure",
    statusCode,
    ipAddress: metadata?.ipAddress,
    userAgent: metadata?.userAgent,
  });
}

/**
 * Get audit logs for a resource
 */
export async function getAuditLogs(
  resourceId: string,
  limit: number = 50
): Promise<AuditLog[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .eq("resource_id", resourceId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (
      data?.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        action: row.action,
        resource: row.resource,
        resourceId: row.resource_id,
        details: row.details,
        status: row.status,
        statusCode: row.status_code,
        ipAddress: row.ip_address,
        userAgent: row.user_agent,
        timestamp: row.created_at,
      })) || []
    );
  } catch (error) {
    console.error("[Audit] Error fetching logs:", error);
    return [];
  }
}

/**
 * Get audit logs for a user
 */
export async function getUserAuditLogs(
  userId: string,
  limit: number = 100
): Promise<AuditLog[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (
      data?.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        action: row.action,
        resource: row.resource,
        resourceId: row.resource_id,
        details: row.details,
        status: row.status,
        statusCode: row.status_code,
        ipAddress: row.ip_address,
        userAgent: row.user_agent,
        timestamp: row.created_at,
      })) || []
    );
  } catch (error) {
    console.error("[Audit] Error fetching user logs:", error);
    return [];
  }
}

/**
 * Detect suspicious activity
 */
export async function detectSuspiciousActivity(
  userId: string,
  threshold: number = 50
): Promise<boolean> {
  try {
    const supabase = await createClient();
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from("audit_logs")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "failure")
      .gte("created_at", fiveMinutesAgo);

    if (error) throw error;

    return (data?.length || 0) > threshold;
  } catch (error) {
    console.error("[Audit] Error detecting suspicious activity:", error);
    return false;
  }
}
