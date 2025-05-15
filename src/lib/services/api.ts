/**
 * API service for making requests to the server
 * This file provides utility functions for interacting with the API endpoints
 */

/**
 * Fetch data from the API with proper error handling
 * @param endpoint - The API endpoint to fetch from (without the /api/ prefix)
 * @param options - Fetch options (method, headers, body, etc.)
 * @returns The JSON response from the API
 * @throws Error if the request fails
 */
export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`/api/${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    },
    credentials: 'include' // Include cookies for authentication
  });
  
  if (!response.ok) {
    // Try to parse error message from response
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API request failed with status ${response.status}`);
  }
  
  return await response.json();
}

/**
 * Make a GET request to the API
 * @param endpoint - The API endpoint to fetch from (without the /api/ prefix)
 * @param params - Query parameters to include in the URL
 * @returns The JSON response from the API
 */
export async function get<T>(endpoint: string, params?: Record<string, string | number | boolean>): Promise<T> {
  const url = new URL(`/api/${endpoint}`, window.location.origin);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });
  }
  
  return fetchApi<T>(url.pathname.substring(5) + url.search);
}

/**
 * Make a POST request to the API
 * @param endpoint - The API endpoint to post to (without the /api/ prefix)
 * @param data - The data to send in the request body
 * @returns The JSON response from the API
 */
export async function post<T>(endpoint: string, data: any): Promise<T> {
  return fetchApi<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

/**
 * Make a PUT request to the API
 * @param endpoint - The API endpoint to put to (without the /api/ prefix)
 * @param data - The data to send in the request body
 * @returns The JSON response from the API
 */
export async function put<T>(endpoint: string, data: any): Promise<T> {
  return fetchApi<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

/**
 * Make a DELETE request to the API
 * @param endpoint - The API endpoint to delete from (without the /api/ prefix)
 * @returns The JSON response from the API
 */
export async function del<T>(endpoint: string): Promise<T> {
  return fetchApi<T>(endpoint, {
    method: 'DELETE'
  });
}
