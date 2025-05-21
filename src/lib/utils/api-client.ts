'use client';

import { useAuth } from '@/lib/auth/AuthContext';
import { auth, signIn, signOut } from '@auth';

// Define the API client interface
export interface ApiClient {
  get: <T>(url: string, options?: RequestInit) => Promise<T>;
  post: <T>(url: string, data: any, options?: RequestInit) => Promise<T>;
  put: <T>(url: string, data: any, options?: RequestInit) => Promise<T>;
  delete: <T>(url: string, options?: RequestInit) => Promise<T>;
}

/**
 * Create a basic API client without hooks
 * This version can be used in non-React contexts or server components
 */
export function createBasicApiClient(): ApiClient {
  /**
   * Enhanced fetch function with basic error handling
   */
  const fetchWithBasicAuth = async (url: string, options: RequestInit = {}) => {
    // First attempt
    let response = await fetch(url, options);
    
    // If we get a 401 Unauthorized, we can't refresh the session here
    // because we don't have access to the auth context
    if (response.status === 401) {
      console.error('Unauthorized request, session may have expired');
    }
    
    return response;
  };
  
  return {
    get: async <T>(url: string, options: RequestInit = {}): Promise<T> => {
      // Ensure the URL starts with /api/
      const apiUrl = url.startsWith('/api/') ? url : `/api/${url}`;
      
      console.log(`[BasicApiClient] GET request to: ${apiUrl}`);
      
      const response = await fetchWithBasicAuth(apiUrl, {
        ...options,
        method: 'GET',
      });
      
      if (!response.ok) {
        console.error(`[BasicApiClient] GET request failed: ${apiUrl} (${response.status})`);
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      return response.json();
    },
    
    post: async <T>(url: string, data: any, options: RequestInit = {}): Promise<T> => {
      // Ensure the URL starts with /api/
      const apiUrl = url.startsWith('/api/') ? url : `/api/${url}`;
      
      console.log(`[BasicApiClient] POST request to: ${apiUrl}`);
      
      const response = await fetchWithBasicAuth(apiUrl, {
        ...options,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        console.error(`[BasicApiClient] POST request failed: ${apiUrl} (${response.status})`);
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      return response.json();
    },
    
    put: async <T>(url: string, data: any, options: RequestInit = {}): Promise<T> => {
      // Ensure the URL starts with /api/
      const apiUrl = url.startsWith('/api/') ? url : `/api/${url}`;
      
      console.log(`[BasicApiClient] PUT request to: ${apiUrl}`);
      
      const response = await fetchWithBasicAuth(apiUrl, {
        ...options,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        console.error(`[BasicApiClient] PUT request failed: ${apiUrl} (${response.status})`);
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      return response.json();
    },
    
    delete: async <T>(url: string, options: RequestInit = {}): Promise<T> => {
      // Ensure the URL starts with /api/
      const apiUrl = url.startsWith('/api/') ? url : `/api/${url}`;
      
      console.log(`[BasicApiClient] DELETE request to: ${apiUrl}`);
      
      const response = await fetchWithBasicAuth(apiUrl, {
        ...options,
        method: 'DELETE',
      });
      
      if (!response.ok) {
        console.error(`[BasicApiClient] DELETE request failed: ${apiUrl} (${response.status})`);
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      return response.json();
    },
  };
}

/**
 * Create an API client with authentication handling
 * This version should only be used within React components
 */
export function createAuthApiClient(refreshSession: (forceReload?: boolean) => Promise<boolean>, logout: () => void): ApiClient {
  /**
   * Enhanced fetch function with authentication handling
   */
  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    // First attempt
    let response = await fetch(url, options);
    
    // If we get a 401 Unauthorized, try to refresh the session
    if (response.status === 401) {
      // Try to refresh the session with forceReload=true to ensure we get the latest session state
      const refreshSuccessful = await refreshSession(true);
      
      // If refresh was successful, the page will reload automatically
      // If not, log out the user
      if (!refreshSuccessful) {
        console.error('Session refresh failed, logging out');
        logout();
      }
    }
    
    return response;
  };
  
  return {
    get: async <T>(url: string, options: RequestInit = {}): Promise<T> => {
      // Ensure the URL starts with /api/
      const apiUrl = url.startsWith('/api/') ? url : `/api/${url}`;
      
      console.log(`[AuthApiClient] GET request to: ${apiUrl}`);
      
      const response = await fetchWithAuth(apiUrl, {
        ...options,
        method: 'GET',
      });
      
      if (!response.ok) {
        console.error(`[AuthApiClient] GET request failed: ${apiUrl} (${response.status})`);
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      return response.json();
    },
    
    post: async <T>(url: string, data: any, options: RequestInit = {}): Promise<T> => {
      // Ensure the URL starts with /api/
      const apiUrl = url.startsWith('/api/') ? url : `/api/${url}`;
      
      console.log(`[AuthApiClient] POST request to: ${apiUrl}`);
      
      const response = await fetchWithAuth(apiUrl, {
        ...options,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        console.error(`[AuthApiClient] POST request failed: ${apiUrl} (${response.status})`);
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      return response.json();
    },
    
    put: async <T>(url: string, data: any, options: RequestInit = {}): Promise<T> => {
      // Ensure the URL starts with /api/
      const apiUrl = url.startsWith('/api/') ? url : `/api/${url}`;
      
      console.log(`[AuthApiClient] PUT request to: ${apiUrl}`);
      
      const response = await fetchWithAuth(apiUrl, {
        ...options,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        console.error(`[AuthApiClient] PUT request failed: ${apiUrl} (${response.status})`);
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      return response.json();
    },
    
    delete: async <T>(url: string, options: RequestInit = {}): Promise<T> => {
      // Ensure the URL starts with /api/
      const apiUrl = url.startsWith('/api/') ? url : `/api/${url}`;
      
      console.log(`[AuthApiClient] DELETE request to: ${apiUrl}`);
      
      const response = await fetchWithAuth(apiUrl, {
        ...options,
        method: 'DELETE',
      });
      
      if (!response.ok) {
        console.error(`[AuthApiClient] DELETE request failed: ${apiUrl} (${response.status})`);
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      return response.json();
    },
  };
}

/**
 * Custom hook to use the API client within React components
 * @returns API client with authentication handling
 */
export function useApiClient(): ApiClient {
  const { refreshSession, logout } = useAuth();
  return createAuthApiClient(refreshSession, logout);
}
