'use client';

import React, { createContext, useContext, ReactNode, useEffect, useRef, useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Define the User type
export interface User {
  id: number;
  username: string;
  displayName: string;
  theme?: string;
  timezone: string;
}

// Define the shape of our authentication context
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: UserRegistrationData) => Promise<boolean>;
  updateUserTimezone: (timezone: string) => Promise<boolean>;
  refreshSession: (forceReload?: boolean) => Promise<boolean>;
  sessionExpired: boolean;
}

// Data needed for user registration
export interface UserRegistrationData {
  username: string;
  password: string;
  displayName: string;
  timezone?: string;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => false,
  logout: () => {},
  register: async () => false,
  updateUserTimezone: async () => false,
  refreshSession: async () => false,
  sessionExpired: false,
});

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();
  const [sessionExpired, setSessionExpired] = useState(false);
  const lastActivityTime = useRef(Date.now());
  const sessionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Session activity tracker
  useEffect(() => {
    // Reset session expired state when session changes
    if (session) {
      setSessionExpired(false);
    }
    
    // Track user activity to detect idle timeout
    const updateLastActivity = () => {
      lastActivityTime.current = Date.now();
      
      // If session was marked as expired but user is active, try to refresh
      if (sessionExpired && session) {
        refreshSession();
      }
    };
    
    // Set up activity listeners
    window.addEventListener('mousemove', updateLastActivity);
    window.addEventListener('keydown', updateLastActivity);
    window.addEventListener('click', updateLastActivity);
    window.addEventListener('scroll', updateLastActivity);
    
    // Check session status periodically
    const checkSessionStatus = async () => {
      try {
        // Only check if we have an active session
        if (session) {
          // Make a lightweight API call to verify session is still valid on server
          const response = await fetch('/api/auth/session-check');
          
          if (!response.ok) {
            // If server reports session invalid, mark as expired
            setSessionExpired(true);
          }
        }
      } catch (error) {
        console.error('Session check error:', error);
      }
    };
    
    // Set up periodic session check (every 5 minutes)
    sessionTimeoutRef.current = setInterval(checkSessionStatus, 5 * 60 * 1000);
    
    return () => {
      // Clean up event listeners and interval
      window.removeEventListener('mousemove', updateLastActivity);
      window.removeEventListener('keydown', updateLastActivity);
      window.removeEventListener('click', updateLastActivity);
      window.removeEventListener('scroll', updateLastActivity);
      
      if (sessionTimeoutRef.current) {
        clearInterval(sessionTimeoutRef.current);
      }
    };
  }, [session, sessionExpired]);

  // Login function
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      });
      
      return result?.ok || false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    // Use a relative URL for the callback
    // This ensures the redirect works correctly regardless of how the app is accessed
    signOut({ callbackUrl: '/' });
  };

  // Register function
  const register = async (userData: UserRegistrationData): Promise<boolean> => {
    try {
      // Call the API to register a new user
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: userData.username,
          password: userData.password,
          displayName: userData.displayName,
          timezone: userData.timezone || 'America/New_York', // Default timezone if not provided
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Registration failed:', errorData);
        return false;
      }
      
      // If registration is successful, log the user in
      return await login(userData.username, userData.password);
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  // Update user timezone
  const updateUserTimezone = async (timezone: string): Promise<boolean> => {
    if (!session?.user?.id) return false;
    
    try {
      const response = await fetch('/api/users/timezone', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ timezone }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Timezone update failed:', errorData);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Timezone update error:', error);
      return false;
    }
  };

  // Session refresh function
  const refreshSession = async (forceReload = false): Promise<boolean> => {
    try {
      if (!session) return false;
      
      // Call NextAuth's update function to refresh the session
      const updatedSession = await updateSession();
      
      // Reset session expired state if refresh was successful
      if (updatedSession) {
        setSessionExpired(false);
        
        // Force a reload of the page to ensure all components reflect the latest session state
        // This is especially important after making changes to the site
        if (forceReload && typeof window !== 'undefined') {
          // Add a small delay to ensure the session update is complete
          setTimeout(() => {
            window.location.reload();
          }, 100);
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Session refresh error:', error);
      return false;
    }
  };

  // Create the context value with proper mapping for displayName and username
  const value = {
    user: session?.user ? {
      ...session.user,
      // Ensure the ID is a number for our application's internal use
      id: typeof session.user.id === 'string' ? parseInt(session.user.id, 10) : session.user.id,
      displayName: session.user.name || '', // Map NextAuth's name to our displayName
      username: session.user.email || '', // Map NextAuth's email to our username
      timezone: session.user.timezone || 'America/New_York', // Default timezone if not provided
    } : null,
    isAuthenticated: !!session?.user && !sessionExpired,
    isLoading: status === 'loading',
    login,
    logout,
    register,
    updateUserTimezone,
    refreshSession,
    sessionExpired
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
