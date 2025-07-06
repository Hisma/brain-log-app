/**
 * Utility functions for handling session refresh
 * Client-side only
 */

'use client';

import { getSession, signIn as nextAuthSignIn } from 'next-auth/react';

// Constants for refresh parameters
const REFRESH_PARAM = 'refreshed';
const REFRESH_VALUE = 'true';
const SESSION_LAST_CHECKED = 'session_last_checked';

/**
 * Refreshes the user's session
 * @param forceReload Whether to force a page reload after refreshing the session
 * @returns A promise that resolves to true if the session was refreshed successfully, false otherwise
 */
export async function refreshSession(forceReload = false): Promise<boolean> {
  try {
    // Check if we have a session
    const session = await getSession();
    
    if (!session) {
      return false;
    }
    
    // Make a request to the session-check endpoint to validate the session
    // Use a cache-busting query parameter to ensure we get a fresh response
    const cacheBuster = Date.now();
    const response = await fetch(`/api/auth/session-check?_=${cacheBuster}`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      // Ensure we're not using a cached response
      cache: 'no-store',
      next: { revalidate: 0 }
    });
    
    if (!response.ok) {
      // If the session is invalid, try to refresh it
      // This is a lightweight call that doesn't require credentials
      const result = await nextAuthSignIn('credentials', { redirect: false });
      
      // If forceReload is true or the refresh was successful, reload the page
      if (forceReload && result?.ok) {
        forceRefresh();
      }
      
      return !!result?.ok;
    } else {
      // Session is still valid, update the last checked timestamp
      if (typeof window !== 'undefined') {
        localStorage.setItem(SESSION_LAST_CHECKED, Date.now().toString());
      }
      
      // If forceReload is true, reload the page even if the session is valid
      if (forceReload) {
        forceRefresh();
      }
      
      return true;
    }
  } catch (error) {
    console.error('Error refreshing session:', error);
    return false;
  }
}

/**
 * Forces a page refresh with a special URL parameter to indicate the refresh
 * This is useful for components that need to know if they were just refreshed
 */
export function forceRefresh(): void {
  if (typeof window === 'undefined') return;
  
  // Add a query parameter to the URL to indicate a refresh
  const url = new URL(window.location.href);
  url.searchParams.set(REFRESH_PARAM, REFRESH_VALUE);
  
  // Reload the page with the new URL
  window.location.href = url.toString();
}

/**
 * Checks if the current page was loaded as a result of a refresh
 * @returns True if the page was refreshed, false otherwise
 */
export function wasRefreshed(): boolean {
  if (typeof window === 'undefined') return false;
  
  const url = new URL(window.location.href);
  return url.searchParams.get(REFRESH_PARAM) === REFRESH_VALUE;
}

/**
 * Removes the refresh parameter from the URL
 * This should be called after handling a refresh to clean up the URL
 */
export function cleanRefreshParam(): void {
  if (typeof window === 'undefined') return;
  
  const url = new URL(window.location.href);
  
  if (url.searchParams.has(REFRESH_PARAM)) {
    url.searchParams.delete(REFRESH_PARAM);
    
    // Replace the current URL without causing a page reload
    window.history.replaceState({}, '', url.toString());
  }
}

/**
 * Clears any cached session data
 */
export function clearSessionCache(): void {
  if (typeof window === 'undefined') return;
  
  // Clear any session data from localStorage or cookies
  try {
    // Remove any session-related items from localStorage
    localStorage.removeItem('sessionData');
    localStorage.removeItem(SESSION_LAST_CHECKED);
    
    // Clear any session cookies
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.trim().split('=');
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
  } catch (error) {
    console.error('Error clearing session cache:', error);
  }
}
