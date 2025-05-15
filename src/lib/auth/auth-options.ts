import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials || !credentials.username || !credentials.password) {
          return null;
        }
        
        try {
          // Find user by username
          const user = await prisma.user.findUnique({
            where: { username: credentials.username }
          });
          
          if (!user) {
            return null;
          }
          
          // Verify password
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          );
          
          if (!isPasswordValid) {
            return null;
          }
          
          // Update last login time
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() }
          });
          
          // Return user data (without password hash)
          return {
            id: user.id.toString(),
            name: user.displayName,
            email: user.username,
            username: user.username, // Explicitly include username
            theme: user.theme
          };
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.theme = user.theme;
        token.username = user.username || user.email || ''; // Use username directly if available, fallback to email
      }
      
      // Handle updates to the session
      if (trigger === "update" && session) {
        // Update the token with the new session data
        if (session.user?.name) {
          token.name = session.user.name;
        }
        if (session.user?.theme) {
          token.theme = session.user.theme;
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = parseInt(token.id as string);
        session.user.theme = token.theme as string;
        session.user.username = token.username as string; // Add username to session
        
        // Ensure name is synchronized with the token
        if (token.name) {
          session.user.name = token.name as string;
        }
      }
      return session;
    },
    // Custom redirect callback to handle IP address access
    async redirect({ url, baseUrl }) {
      // For relative URLs, keep them as is (they'll use the current origin)
      if (url.startsWith('/')) {
        return url;
      }
      
      // For absolute URLs, check if they're on the same host
      try {
        const urlObj = new URL(url);
        const baseUrlObj = new URL(baseUrl);
        
        if (urlObj.hostname === baseUrlObj.hostname) {
          return url;
        }
      } catch (error) {
        // If URL parsing fails, fall back to default behavior
        console.error('Error parsing URL in redirect callback:', error);
      }
      
      // Default to baseUrl for external URLs
      return baseUrl;
    }
  },
  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/login'
  },
  debug: process.env.NODE_ENV === 'development'
};

// Extend next-auth types
declare module 'next-auth' {
  interface User {
    id: string;
    theme: string;
    username?: string; // Add username to User type
  }
  
  interface Session {
    user: {
      id: number;
      theme: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      username: string; // Add username to session type
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    theme: string;
    username: string; // Add username to JWT type
  }
}
