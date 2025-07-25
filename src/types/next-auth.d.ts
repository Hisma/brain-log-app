declare module "next-auth" {
  /**
   * Extend the built-in session types
   */
  interface Session {
    user: {
      id: number
      timezone: string
      theme?: string
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
    timezone: string
    theme?: string
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
    timezone: string
    theme?: string
  }
}
