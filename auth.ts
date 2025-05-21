import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { compare } from "bcryptjs";
import { JWT } from "next-auth/jwt";

const prisma = new PrismaClient();

/**
 * Auth.js v5 configuration
 * This is the main configuration file for Auth.js
 * It exports the auth() function which can be used in both server and client components
 */
export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      // If user is defined, this is the first sign in
      if (user) {
        // Store the ID as a string in the token
        // The ID comes as a string from the authorize function
        token.id = user.id;
        token.timezone = user.timezone || "America/New_York";
      }
      
      return token;
    },
    async session({ session, token }: { session: any; token: JWT }) {
      if (token && session.user) {
        // Convert the string ID from the token to a number for Prisma compatibility
        session.user.id = parseInt(String(token.id), 10);
        session.user.timezone = token.timezone;
      }
      
      return session;
    },
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      // The request parameter is required by NextAuth.js type definition
      // even though we're not using it in our implementation
      async authorize(credentials, request) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }
        
        // Find the user in the database
        const username = credentials.username as string;
        const user = await prisma.user.findUnique({
          where: { username },
        });
        
        // If user doesn't exist or password doesn't match, return null
        if (!user) {
          return null;
        }
        
        // Ensure password and hash are strings
        const password = credentials.password as string;
        const hash = user.passwordHash as string;
        
        // Compare password with hash
        if (!(await compare(password, hash))) {
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
