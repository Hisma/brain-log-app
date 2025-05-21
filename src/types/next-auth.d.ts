import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  /**
   * Extend the built-in session types
   */
  interface Session {
    user: {
      id: number
      timezone: string
      theme?: string
    } & DefaultSession["user"]
  }

  /**
   * Extend the built-in user types
   */
  interface User {
    id: string
    timezone: string
    theme?: string
  }
}

declare module "next-auth/jwt" {
  /**
   * Extend the built-in JWT types
   */
  interface JWT {
    id: string
    timezone: string
    theme?: string
  }
}
