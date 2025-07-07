import { sql } from '@/lib/neon';
import { auditLog } from '@/lib/audit';

// Define role hierarchy and permissions
export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  USER: 'USER'
} as const;

export const PERMISSIONS = {
  // User Management
  USER_READ: 'USER_READ',
  USER_CREATE: 'USER_CREATE',
  USER_UPDATE: 'USER_UPDATE',
  USER_DELETE: 'USER_DELETE',
  
  // Role Management
  ROLE_READ: 'ROLE_READ',
  ROLE_ASSIGN: 'ROLE_ASSIGN',
  ROLE_REVOKE: 'ROLE_REVOKE',
  
  // System Administration
  SYSTEM_SETTINGS: 'SYSTEM_SETTINGS',
  AUDIT_LOG_READ: 'AUDIT_LOG_READ',
  
  // Data Access
  DATA_READ_OWN: 'DATA_READ_OWN',
  DATA_WRITE_OWN: 'DATA_WRITE_OWN',
  DATA_READ_ALL: 'DATA_READ_ALL',
  DATA_WRITE_ALL: 'DATA_WRITE_ALL',
} as const;

// Role-Permission mappings
export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.ROLE_READ,
    PERMISSIONS.ROLE_ASSIGN,
    PERMISSIONS.ROLE_REVOKE,
    PERMISSIONS.SYSTEM_SETTINGS,
    PERMISSIONS.AUDIT_LOG_READ,
    PERMISSIONS.DATA_READ_ALL,
    PERMISSIONS.DATA_WRITE_ALL,
  ],
  [ROLES.ADMIN]: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.ROLE_READ,
    PERMISSIONS.ROLE_ASSIGN,
    PERMISSIONS.AUDIT_LOG_READ,
    PERMISSIONS.DATA_READ_ALL,
    PERMISSIONS.DATA_WRITE_ALL,
  ],
  [ROLES.USER]: [
    PERMISSIONS.DATA_READ_OWN,
    PERMISSIONS.DATA_WRITE_OWN,
  ],
} as const;

export type Role = keyof typeof ROLES;
export type Permission = keyof typeof PERMISSIONS;
export type PermissionValue = (typeof PERMISSIONS)[Permission];

interface AuditContext {
  action: string;
  resource: string;
  details?: Record<string, unknown>;
}

// Core RBAC functions using direct SQL
export async function hasPermission(
  userId: number, 
  permission: string,
  resourceUserId?: number
): Promise<boolean> {
  try {
    const users = await sql`
      SELECT id, role 
      FROM "User" 
      WHERE id = ${userId}
      LIMIT 1
    `;

    if (users.length === 0) {
      return false;
    }

    const user = users[0];
    const userRole = user.role as Role;
    const userPermissions = ROLE_PERMISSIONS[userRole] || [];
    
    // Check if user has the exact permission
    if ((userPermissions as readonly string[]).includes(permission)) {
      return true;
    }

    // Special handling for "own" permissions
    if (permission.endsWith('_OWN') && resourceUserId) {
      return user.id === resourceUserId;
    }

    return false;
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
}

export async function requirePermission(
  userId: number,
  permission: string,
  resourceUserId?: number,
  auditContext?: AuditContext
): Promise<void> {
  const hasAccess = await hasPermission(userId, permission, resourceUserId);
  
  if (!hasAccess) {
    // Log unauthorized access attempt (only if audit is available)
    if (auditContext) {
      try {
        await auditLog({
          userId,
          action: `UNAUTHORIZED_${auditContext.action}`,
          resource: auditContext.resource,
          details: {
            ...auditContext.details,
            permission,
            reason: 'Access denied'
          }
        });
      } catch (auditError) {
        // Don't fail the permission check due to audit failure
        console.error('Audit logging failed:', auditError);
      }
    }
    
    throw new Error('Insufficient permissions');
  }
}

export async function hasRole(userId: number, role: string): Promise<boolean> {
  try {
    const users = await sql`
      SELECT role 
      FROM "User" 
      WHERE id = ${userId}
      LIMIT 1
    `;

    return users.length > 0 && users[0].role === role;
  } catch (error) {
    console.error('Error checking role:', error);
    return false;
  }
}

export async function isAdmin(userId: number): Promise<boolean> {
  return await hasRole(userId, ROLES.ADMIN) || await hasRole(userId, ROLES.SUPER_ADMIN);
}

export async function isSuperAdmin(userId: number): Promise<boolean> {
  return await hasRole(userId, ROLES.SUPER_ADMIN);
}

// User management functions (these will be used in API routes, not middleware)
export async function assignRole(
  adminUserId: number,
  targetUserId: number,
  role: string,
  auditContext?: { ipAddress?: string; userAgent?: string }
): Promise<void> {
  // Check if admin has permission to assign roles
  await requirePermission(adminUserId, PERMISSIONS.ROLE_ASSIGN);

  // Validate role
  if (!Object.values(ROLES).includes(role as Role)) {
    throw new Error('Invalid role');
  }

  // Super admin role can only be assigned by another super admin
  if (role === ROLES.SUPER_ADMIN) {
    const isSuperAdminUser = await isSuperAdmin(adminUserId);
    if (!isSuperAdminUser) {
      throw new Error('Only super admins can assign super admin role');
    }
  }

  // Update user role
  await sql`
    UPDATE "User" 
    SET role = ${role}
    WHERE id = ${targetUserId}
  `;

  // Audit log
  try {
    await auditLog({
      userId: adminUserId,
      action: 'ROLE_ASSIGNED',
      resource: 'User',
      details: {
        targetUserId,
        newRole: role
      },
      ipAddress: auditContext?.ipAddress,
      userAgent: auditContext?.userAgent
    });
  } catch (auditError) {
    console.error('Audit logging failed:', auditError);
  }
}

export async function revokeRole(
  adminUserId: number,
  targetUserId: number,
  auditContext?: { ipAddress?: string; userAgent?: string }
): Promise<void> {
  // Check if admin has permission to revoke roles
  await requirePermission(adminUserId, PERMISSIONS.ROLE_REVOKE);

  // Get current role for audit
  const targetUsers = await sql`
    SELECT role 
    FROM "User" 
    WHERE id = ${targetUserId}
    LIMIT 1
  `;

  const previousRole = targetUsers.length > 0 ? targetUsers[0].role : null;

  // Update user role to USER (default)
  await sql`
    UPDATE "User" 
    SET role = ${ROLES.USER}
    WHERE id = ${targetUserId}
  `;

  // Audit log
  try {
    await auditLog({
      userId: adminUserId,
      action: 'ROLE_REVOKED',
      resource: 'User',
      details: {
        targetUserId,
        previousRole,
        newRole: ROLES.USER
      },
      ipAddress: auditContext?.ipAddress,
      userAgent: auditContext?.userAgent
    });
  } catch (auditError) {
    console.error('Audit logging failed:', auditError);
  }
}

// Utility functions for UI
export function getRoleDisplayName(role: string): string {
  switch (role) {
    case ROLES.SUPER_ADMIN:
      return 'Super Administrator';
    case ROLES.ADMIN:
      return 'Administrator';
    case ROLES.USER:
      return 'User';
    default:
      return 'Unknown';
  }
}

export function getRolePermissions(role: string): readonly string[] {
  return ROLE_PERMISSIONS[role as Role] || [];
}

export function getPermissionDisplayName(permission: string): string {
  switch (permission) {
    case PERMISSIONS.USER_READ:
      return 'View Users';
    case PERMISSIONS.USER_CREATE:
      return 'Create Users';
    case PERMISSIONS.USER_UPDATE:
      return 'Update Users';
    case PERMISSIONS.USER_DELETE:
      return 'Delete Users';
    case PERMISSIONS.ROLE_READ:
      return 'View Roles';
    case PERMISSIONS.ROLE_ASSIGN:
      return 'Assign Roles';
    case PERMISSIONS.ROLE_REVOKE:
      return 'Revoke Roles';
    case PERMISSIONS.SYSTEM_SETTINGS:
      return 'System Settings';
    case PERMISSIONS.AUDIT_LOG_READ:
      return 'View Audit Logs';
    case PERMISSIONS.DATA_READ_OWN:
      return 'Read Own Data';
    case PERMISSIONS.DATA_WRITE_OWN:
      return 'Write Own Data';
    case PERMISSIONS.DATA_READ_ALL:
      return 'Read All Data';
    case PERMISSIONS.DATA_WRITE_ALL:
      return 'Write All Data';
    default:
      return permission;
  }
}

// Data access helpers (for use in middleware and API routes)
export async function canAccessUserData(
  requestingUserId: number,
  targetUserId: number
): Promise<boolean> {
  // Users can always access their own data
  if (requestingUserId === targetUserId) {
    return true;
  }

  // Check if user has admin permissions
  return await hasPermission(requestingUserId, PERMISSIONS.DATA_READ_ALL);
}

export async function canModifyUserData(
  requestingUserId: number,
  targetUserId: number
): Promise<boolean> {
  // Users can always modify their own data
  if (requestingUserId === targetUserId) {
    return true;
  }

  // Check if user has admin permissions
  return await hasPermission(requestingUserId, PERMISSIONS.DATA_WRITE_ALL);
}

// Get user with role (lightweight function for middleware)
export async function getUserRole(userId: number): Promise<string | null> {
  try {
    const users = await sql`
      SELECT role 
      FROM "User" 
      WHERE id = ${userId}
      LIMIT 1
    `;

    return users.length > 0 ? users[0].role : null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}

// Check if user exists (lightweight function for middleware)
export async function userExists(userId: number): Promise<boolean> {
  try {
    const result = await sql`
      SELECT EXISTS(
        SELECT 1 FROM "User" WHERE id = ${userId}
      ) as exists
    `;

    return result[0]?.exists || false;
  } catch (error) {
    console.error('Error checking if user exists:', error);
    return false;
  }
}
