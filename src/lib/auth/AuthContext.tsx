'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Define the shape of our authentication context
interface AuthContextType {
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: UserRegistrationData) => Promise<boolean>;
}

// Data needed for user registration
export interface UserRegistrationData {
  username: string;
  password: string;
  displayName: string;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => false,
  logout: () => {},
  register: async () => false,
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
  const { data: session, status } = useSession();
  const router = useRouter();

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

  // Create the context value with proper mapping for displayName and username
  const value = {
    user: session?.user ? {
      ...session.user,
      displayName: session.user.name || '', // Map NextAuth's name to our displayName
      username: session.user.email || '' // Map NextAuth's email to our username
    } : null,
    isAuthenticated: !!session?.user,
    isLoading: status === 'loading',
    login,
    logout,
    register
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
