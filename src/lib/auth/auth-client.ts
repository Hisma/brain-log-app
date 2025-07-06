'use client';

import { signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react';

/**
 * Client-side authentication utilities
 * This file is safe to import in client components
 */

// Client-side login function
export async function signIn(username: string, password: string): Promise<boolean> {
  try {
    const result = await nextAuthSignIn('credentials', {
      username,
      password,
      redirect: false,
    });
    
    return result?.ok || false;
  } catch (error) {
    console.error('Login error:', error);
    return false;
  }
}

// Client-side logout function
export function signOut(callbackUrl = '/') {
  nextAuthSignOut({ callbackUrl });
}

// Client-side session refresh function
export async function refreshClientSession(): Promise<boolean> {
  try {
    // Make a request to the session-check endpoint to validate the session
    const cacheBuster = Date.now();
    const response = await fetch(`/api/auth/session-check?_=${cacheBuster}`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      cache: 'no-store',
      next: { revalidate: 0 }
    });
    
    return response.ok;
  } catch (error) {
    console.error('Session refresh error:', error);
    return false;
  }
}

// Force a page refresh with a special URL parameter
export function forceRefresh(): void {
  if (typeof window === 'undefined') return;
  
  // Add a query parameter to the URL to indicate a refresh
  const url = new URL(window.location.href);
  url.searchParams.set('refreshed', 'true');
  
  // Reload the page with the new URL
  window.location.href = url.toString();
}

// Check if the current page was loaded as a result of a refresh
export function wasRefreshed(): boolean {
  if (typeof window === 'undefined') return false;
  
  const url = new URL(window.location.href);
  return url.searchParams.get('refreshed') === 'true';
}

// Remove the refresh parameter from the URL
export function cleanRefreshParam(): void {
  if (typeof window === 'undefined') return;
  
  const url = new URL(window.location.href);
  
  if (url.searchParams.has('refreshed')) {
    url.searchParams.delete('refreshed');
    
    // Replace the current URL without causing a page reload
    window.history.replaceState({}, '', url.toString());
  }
}
