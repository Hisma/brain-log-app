import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { sql } from "@/lib/neon";
import { comparePasswords } from "@/lib/crypto";
import { auditLog } from "@/lib/audit";

// Define UserRole to match Prisma schema
type UserRole = "PENDING" | "USER" | "ADMIN";

/**
 * Auth.js v5 configuration
 * This file contains Node.js dependencies and should only be used in API routes
 * The middleware uses auth.config.ts which is Edge Runtime compatible
 */
export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: Record<string, unknown>, request?: any) {
        console.log('🔐 Auth.js authorize function called');
        console.log('🔐 Credentials received:', { username: credentials?.username, hasPassword: !!credentials?.password });
        
        if (!credentials?.username || !credentials?.password) {
          console.log('❌ Missing username or password');
          return null;
        }
        
        const username = credentials.username as string;
        const password = credentials.password as string;
        
        try {
          console.log('🔐 Starting database query for user:', username);
          
          // Get user with role and active status (search by username or email)
          const users = await sql`
            SELECT id, username, "passwordHash", "displayName", timezone, theme, role, "isActive", "failedLoginAttempts", "lockedUntil"
            FROM "User" 
            WHERE username = ${username} OR email = ${username}
          `;
          
          console.log('🔐 Database query completed. Users found:', users.length);
          
          if (users.length === 0) {
            console.log('❌ User not found:', username);
            await auditLog({
              userId: null, // Explicitly set to null for non-existent users
              action: "LOGIN_FAILED",
              resource: "AUTH",
              details: { username, reason: "user_not_found" },
              ipAddress: request?.headers?.get?.("x-forwarded-for") || "unknown",
              userAgent: request?.headers?.get?.("user-agent") || "unknown",
            });
            return null;
          }
          
          const user = users[0];
          
          // Check if account is locked
          if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
            await auditLog({
              userId: user.id,
              action: "LOGIN_FAILED",
              resource: "AUTH",
              details: { username, reason: "account_locked" },
              ipAddress: request?.headers?.get?.("x-forwarded-for") || "unknown",
              userAgent: request?.headers?.get?.("user-agent") || "unknown",
            });
            return null;
          }
          
          // Verify password
          const hash = user.passwordHash as string;
          console.log('🔐 Starting password verification');
          console.log('🔐 Hash format:', hash?.substring(0, 20) + '...');
          
          const isValidPassword = await comparePasswords(password, hash);
          console.log('🔐 Password verification result:', isValidPassword);
          
          if (!isValidPassword) {
            console.log('❌ Invalid password for user:', username);
            // Increment failed login attempts
            const failedAttempts = (user.failedLoginAttempts || 0) + 1;
            const maxAttempts = 5; // Could be from SystemSettings
            
            let lockUntil = null;
            if (failedAttempts >= maxAttempts) {
              lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
            }
            
            await sql`
              UPDATE "User" 
              SET "failedLoginAttempts" = ${failedAttempts}, "lockedUntil" = ${lockUntil}
              WHERE id = ${user.id}
            `;
            
            await auditLog({
              userId: user.id,
              action: failedAttempts >= maxAttempts ? "ACCOUNT_LOCKED" : "LOGIN_FAILED",
              resource: "AUTH",
              details: { username, reason: "invalid_password", failedAttempts },
              ipAddress: request?.headers?.get?.("x-forwarded-for") || "unknown",
              userAgent: request?.headers?.get?.("user-agent") || "unknown",
            });
            
            return null;
          }
          
          // Reset failed login attempts and update last login
          await sql`
            UPDATE "User" 
            SET "failedLoginAttempts" = 0, "lockedUntil" = NULL, "lastLoginAt" = NOW()
            WHERE id = ${user.id}
          `;
          
          await auditLog({
            userId: user.id,
            action: "LOGIN_SUCCESS",
            resource: "AUTH",
            details: { username },
            ipAddress: request?.headers?.get?.("x-forwarded-for") || "unknown",
            userAgent: request?.headers?.get?.("user-agent") || "unknown",
          });
          
          // Return user object for session
          const userObj = {
            id: String(user.id),
            name: user.displayName || "",
            email: user.username,
            username: user.username,
            timezone: user.timezone || "America/New_York",
            theme: user.theme || "",
            role: user.role as UserRole,
            isActive: user.isActive as boolean,
          };
          
          console.log('✅ Authentication successful. Returning user:', {
            id: userObj.id,
            username: userObj.username,
            role: userObj.role,
            isActive: userObj.isActive
          });
          
          return userObj;
        } catch (error) {
          console.error("❌ Authentication error:", error);
          console.error("❌ Error details:", {
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            name: error instanceof Error ? error.name : typeof error
          });
          return null;
        }
      },
    }),
  ],
  events: {
    async signOut(message: any) {
      // Check if we have a token with user ID for audit logging
      try {
        if (message?.token?.id) {
          await auditLog({
            userId: parseInt(String(message.token.id)),
            action: "LOGOUT",
            resource: "AUTH",
            details: {},
          });
        }
      } catch (error) {
        // Don't fail signout due to audit logging issues
        console.error("Audit logging failed during signout:", error);
      }
    },
  },
});

// Helper functions for authentication
export const isAuthenticated = async () => {
  const session = await auth();
  return !!session?.user;
};

export const getCurrentUser = async () => {
  const session = await auth();
  return session?.user;
};

export const requireAdmin = async () => {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN' || !session.user.isActive) {
    throw new Error('Admin access required');
  }
  return session.user;
};

export const requireUser = async () => {
  const session = await auth();
  if (!session?.user || !session.user.isActive) {
    throw new Error('Authentication required');
  }
  if (session.user.role === 'PENDING') {
    throw new Error('Account pending approval');
  }
  return session.user;
};
