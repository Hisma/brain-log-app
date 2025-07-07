import { sql } from '@/lib/neon';

interface AuditLogParams {
  userId?: number;
  action: string;
  resource: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

interface AuditLogQueryOptions {
  userId?: number;
  action?: string;
  resource?: string;
  limit?: number;
  offset?: number;
}

interface AuditLogStatsOptions {
  userId?: number;
  timeRange?: '24h' | '7d' | '30d';
}

interface AuditLogWithUser {
  id: number;
  userId: number | null;
  action: string;
  resource: string;
  details: Record<string, unknown>;
  ipAddress: string | null;
  userAgent: string | null;
  timestamp: Date;
  username?: string | null;
  displayName?: string | null;
}

interface AuditLogStats {
  action: string;
  resource: string;
  count: number;
}

export async function auditLog(params: AuditLogParams): Promise<void> {
  try {
    await sql`
      INSERT INTO "AuditLog" (
        "userId", 
        action, 
        resource, 
        details, 
        "ipAddress", 
        "userAgent", 
        timestamp
      )
      VALUES (
        ${params.userId || null},
        ${params.action},
        ${params.resource},
        ${JSON.stringify(params.details || {})},
        ${params.ipAddress || null},
        ${params.userAgent || null},
        NOW()
      )
    `;
  } catch (error) {
    console.error("Audit logging failed:", error);
    // Don't throw - audit failures shouldn't break app functionality
  }
}

export async function getAuditLogs(options: AuditLogQueryOptions): Promise<AuditLogWithUser[]> {
  const { userId, action, resource, limit = 50, offset = 0 } = options;
  
  try {
    let result;
    
    // Build query based on provided filters
    if (userId !== undefined && action && resource) {
      result = await sql`
        SELECT 
          al.id,
          al."userId",
          al.action,
          al.resource,
          al.details,
          al."ipAddress",
          al."userAgent",
          al.timestamp,
          u.username,
          u."displayName"
        FROM "AuditLog" al
        LEFT JOIN "User" u ON al."userId" = u.id
        WHERE al."userId" = ${userId} AND al.action = ${action} AND al.resource = ${resource}
        ORDER BY al.timestamp DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `;
    } else if (userId !== undefined && action) {
      result = await sql`
        SELECT 
          al.id,
          al."userId",
          al.action,
          al.resource,
          al.details,
          al."ipAddress",
          al."userAgent",
          al.timestamp,
          u.username,
          u."displayName"
        FROM "AuditLog" al
        LEFT JOIN "User" u ON al."userId" = u.id
        WHERE al."userId" = ${userId} AND al.action = ${action}
        ORDER BY al.timestamp DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `;
    } else if (userId !== undefined && resource) {
      result = await sql`
        SELECT 
          al.id,
          al."userId",
          al.action,
          al.resource,
          al.details,
          al."ipAddress",
          al."userAgent",
          al.timestamp,
          u.username,
          u."displayName"
        FROM "AuditLog" al
        LEFT JOIN "User" u ON al."userId" = u.id
        WHERE al."userId" = ${userId} AND al.resource = ${resource}
        ORDER BY al.timestamp DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `;
    } else if (userId !== undefined) {
      result = await sql`
        SELECT 
          al.id,
          al."userId",
          al.action,
          al.resource,
          al.details,
          al."ipAddress",
          al."userAgent",
          al.timestamp,
          u.username,
          u."displayName"
        FROM "AuditLog" al
        LEFT JOIN "User" u ON al."userId" = u.id
        WHERE al."userId" = ${userId}
        ORDER BY al.timestamp DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `;
    } else if (action && resource) {
      result = await sql`
        SELECT 
          al.id,
          al."userId",
          al.action,
          al.resource,
          al.details,
          al."ipAddress",
          al."userAgent",
          al.timestamp,
          u.username,
          u."displayName"
        FROM "AuditLog" al
        LEFT JOIN "User" u ON al."userId" = u.id
        WHERE al.action = ${action} AND al.resource = ${resource}
        ORDER BY al.timestamp DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `;
    } else if (action) {
      result = await sql`
        SELECT 
          al.id,
          al."userId",
          al.action,
          al.resource,
          al.details,
          al."ipAddress",
          al."userAgent",
          al.timestamp,
          u.username,
          u."displayName"
        FROM "AuditLog" al
        LEFT JOIN "User" u ON al."userId" = u.id
        WHERE al.action = ${action}
        ORDER BY al.timestamp DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `;
    } else if (resource) {
      result = await sql`
        SELECT 
          al.id,
          al."userId",
          al.action,
          al.resource,
          al.details,
          al."ipAddress",
          al."userAgent",
          al.timestamp,
          u.username,
          u."displayName"
        FROM "AuditLog" al
        LEFT JOIN "User" u ON al."userId" = u.id
        WHERE al.resource = ${resource}
        ORDER BY al.timestamp DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `;
    } else {
      result = await sql`
        SELECT 
          al.id,
          al."userId",
          al.action,
          al.resource,
          al.details,
          al."ipAddress",
          al."userAgent",
          al.timestamp,
          u.username,
          u."displayName"
        FROM "AuditLog" al
        LEFT JOIN "User" u ON al."userId" = u.id
        ORDER BY al.timestamp DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `;
    }
    
    return result.map((row: any) => ({
      id: row.id,
      userId: row.userId,
      action: row.action,
      resource: row.resource,
      details: typeof row.details === 'string' ? JSON.parse(row.details) : row.details,
      ipAddress: row.ipAddress,
      userAgent: row.userAgent,
      timestamp: new Date(row.timestamp),
      username: row.username,
      displayName: row.displayName,
    }));
  } catch (error) {
    console.error('Error getting audit logs:', error);
    return [];
  }
}

export async function getAuditLogStats(options: AuditLogStatsOptions): Promise<AuditLogStats[]> {
  const { userId, timeRange = '7d' } = options;
  
  try {
    let result;
    
    if (timeRange === '24h') {
      if (userId !== undefined) {
        result = await sql`
          SELECT 
            action,
            resource,
            COUNT(*) as count
          FROM "AuditLog"
          WHERE timestamp >= NOW() - INTERVAL '24 hours'
            AND "userId" = ${userId}
          GROUP BY action, resource
          ORDER BY count DESC
        `;
      } else {
        result = await sql`
          SELECT 
            action,
            resource,
            COUNT(*) as count
          FROM "AuditLog"
          WHERE timestamp >= NOW() - INTERVAL '24 hours'
          GROUP BY action, resource
          ORDER BY count DESC
        `;
      }
    } else if (timeRange === '30d') {
      if (userId !== undefined) {
        result = await sql`
          SELECT 
            action,
            resource,
            COUNT(*) as count
          FROM "AuditLog"
          WHERE timestamp >= NOW() - INTERVAL '30 days'
            AND "userId" = ${userId}
          GROUP BY action, resource
          ORDER BY count DESC
        `;
      } else {
        result = await sql`
          SELECT 
            action,
            resource,
            COUNT(*) as count
          FROM "AuditLog"
          WHERE timestamp >= NOW() - INTERVAL '30 days'
          GROUP BY action, resource
          ORDER BY count DESC
        `;
      }
    } else { // 7d default
      if (userId !== undefined) {
        result = await sql`
          SELECT 
            action,
            resource,
            COUNT(*) as count
          FROM "AuditLog"
          WHERE timestamp >= NOW() - INTERVAL '7 days'
            AND "userId" = ${userId}
          GROUP BY action, resource
          ORDER BY count DESC
        `;
      } else {
        result = await sql`
          SELECT 
            action,
            resource,
            COUNT(*) as count
          FROM "AuditLog"
          WHERE timestamp >= NOW() - INTERVAL '7 days'
          GROUP BY action, resource
          ORDER BY count DESC
        `;
      }
    }
    
    return result.map((row: any) => ({
      action: row.action,
      resource: row.resource,
      count: parseInt(row.count, 10),
    }));
  } catch (error) {
    console.error('Error getting audit log stats:', error);
    return [];
  }
}

export async function getRecentAuditActivity(userId?: number, limit: number = 10): Promise<AuditLogWithUser[]> {
  try {
    let result;
    
    if (userId !== undefined) {
      result = await sql`
        SELECT 
          al.id,
          al."userId",
          al.action,
          al.resource,
          al.details,
          al."ipAddress",
          al."userAgent",
          al.timestamp,
          u.username,
          u."displayName"
        FROM "AuditLog" al
        LEFT JOIN "User" u ON al."userId" = u.id
        WHERE al."userId" = ${userId}
        ORDER BY al.timestamp DESC
        LIMIT ${limit}
      `;
    } else {
      result = await sql`
        SELECT 
          al.id,
          al."userId",
          al.action,
          al.resource,
          al.details,
          al."ipAddress",
          al."userAgent",
          al.timestamp,
          u.username,
          u."displayName"
        FROM "AuditLog" al
        LEFT JOIN "User" u ON al."userId" = u.id
        ORDER BY al.timestamp DESC
        LIMIT ${limit}
      `;
    }
    
    return result.map((row: any) => ({
      id: row.id,
      userId: row.userId,
      action: row.action,
      resource: row.resource,
      details: typeof row.details === 'string' ? JSON.parse(row.details) : row.details,
      ipAddress: row.ipAddress,
      userAgent: row.userAgent,
      timestamp: new Date(row.timestamp),
      username: row.username,
      displayName: row.displayName,
    }));
  } catch (error) {
    console.error('Error getting recent audit activity:', error);
    return [];
  }
}

// Utility function to get audit log count for admin dashboards
export async function getAuditLogCount(options: AuditLogQueryOptions = {}): Promise<number> {
  const { userId, action, resource } = options;
  
  try {
    let result;
    
    if (userId !== undefined && action && resource) {
      result = await sql`
        SELECT COUNT(*) as total
        FROM "AuditLog"
        WHERE "userId" = ${userId} AND action = ${action} AND resource = ${resource}
      `;
    } else if (userId !== undefined && action) {
      result = await sql`
        SELECT COUNT(*) as total
        FROM "AuditLog"
        WHERE "userId" = ${userId} AND action = ${action}
      `;
    } else if (userId !== undefined && resource) {
      result = await sql`
        SELECT COUNT(*) as total
        FROM "AuditLog"
        WHERE "userId" = ${userId} AND resource = ${resource}
      `;
    } else if (userId !== undefined) {
      result = await sql`
        SELECT COUNT(*) as total
        FROM "AuditLog"
        WHERE "userId" = ${userId}
      `;
    } else if (action && resource) {
      result = await sql`
        SELECT COUNT(*) as total
        FROM "AuditLog"
        WHERE action = ${action} AND resource = ${resource}
      `;
    } else if (action) {
      result = await sql`
        SELECT COUNT(*) as total
        FROM "AuditLog"
        WHERE action = ${action}
      `;
    } else if (resource) {
      result = await sql`
        SELECT COUNT(*) as total
        FROM "AuditLog"
        WHERE resource = ${resource}
      `;
    } else {
      result = await sql`
        SELECT COUNT(*) as total
        FROM "AuditLog"
      `;
    }
    
    return parseInt(result[0]?.total || '0', 10);
  } catch (error) {
    console.error('Error getting audit log count:', error);
    return 0;
  }
}

// Utility function to clean up old audit logs (for maintenance)
export async function cleanupOldAuditLogs(retentionDays: number = 90): Promise<number> {
  try {
    // First get count of records that will be deleted
    const countResult = await sql`
      SELECT COUNT(*) as total
      FROM "AuditLog"
      WHERE timestamp < NOW() - INTERVAL '${sql.unsafe(retentionDays.toString())} days'
    `;
    
    const deleteCount = parseInt(countResult[0]?.total || '0', 10);
    
    if (deleteCount > 0) {
      // Perform the deletion
      await sql`
        DELETE FROM "AuditLog"
        WHERE timestamp < NOW() - INTERVAL '${sql.unsafe(retentionDays.toString())} days'
      `;
    }
    
    return deleteCount;
  } catch (error) {
    console.error('Failed to cleanup old audit logs:', error);
    return 0;
  }
}
