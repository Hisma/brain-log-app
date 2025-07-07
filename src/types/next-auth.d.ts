import "next-auth";
import { UserRole } from "@prisma/client";

declare module "next-auth" {
  /**
   * Extend the built-in session types
   */
  interface Session {
    user: {
      id: number
      username: string
      timezone: string
      theme?: string
      role: UserRole
      isActive: boolean
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }

  /**
   * Extend the built-in user types
   */
  interface User {
    id: string
    username: string
    timezone: string
    theme?: string
    role: UserRole
    isActive: boolean
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

declare module "next-auth/jwt" {
  /**
   * Extend the built-in JWT types
   */
  interface JWT {
    id: string
    username: string
    timezone: string
    theme?: string
    role: UserRole
    isActive: boolean
  }
}
