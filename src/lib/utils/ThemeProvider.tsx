"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

/**
 * Simple wrapper around next-themes ThemeProvider
 * Following the official next-themes recommendations
 */
export function ThemeProvider({ 
  children, 
  ...props 
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}

// Simply re-export the useTheme hook from next-themes
export { useTheme } from "next-themes"

/**
 * Helper hook to safely use theme on the client-side only
 * Returns true when the component has mounted on the client
 * Use this in components that need to render differently based on theme
 */
export function useHasMounted() {
  const [hasMounted, setHasMounted] = React.useState(false)
  
  React.useEffect(() => {
    setHasMounted(true)
  }, [])
  
  return hasMounted
}
