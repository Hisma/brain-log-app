import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { sql } from "@/lib/neon";
import { comparePasswords } from "@/lib/crypto";

/**
 * Auth.js v5 configuration
 * This file contains Node.js dependencies and should only be used in API routes
 * The middleware uses auth.config.ts which is Edge Runtime compatible
 */
// @ts-expect-error - NextAuth v5 beta has type issues
export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: Record<string, unknown>) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }
        
        // Find the user in the database using Neon serverless (Edge Runtime compatible)
        const username = credentials.username as string;
        const users = await sql`
          SELECT id, username, "passwordHash", "displayName", timezone, theme 
          FROM "User" 
          WHERE username = ${username}
        `;
        
        // If user doesn't exist, return null
        if (users.length === 0) {
          return null;
        }
        
        const user = users[0];
        
        // Ensure password and hash are strings
        const password = credentials.password as string;
        const hash = user.passwordHash as string;
        
        // Compare password with hash using our Edge-compatible crypto function
        if (!(await comparePasswords(password, hash))) {
          return null;
        }
        
        // Return the user object without the password
        return {
          id: String(user.id), // Convert to string for NextAuth compatibility
          name: user.displayName || "",
          email: user.username,
          timezone: user.timezone || "America/New_York",
          theme: user.theme || "",
        };
      },
    }),
  ],
});

// Helper function to check if a user is authenticated
// This can be used in middleware or server components
export const isAuthenticated = async () => {
  const session = await auth();
  return !!session?.user;
};

// Helper function to get the current user
// This can be used in server components
export const getCurrentUser = async () => {
  const session = await auth();
  return session?.user;
};
