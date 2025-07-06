'use client';

import { createBasicApiClient, ApiClient } from '@/lib/utils/api-client';

/**
 * API service for making requests to the server
 * This file provides utility functions for interacting with the API endpoints
 * with automatic session refresh on 401 errors
 */

/**
 * Get the API client instance
 * This function safely handles both React component and non-React contexts
 * Note: For React components that need session refresh, use useApiClient() directly
 */
function getApiClient(): ApiClient {
  // Always use the basic API client for this service layer
  // Components that need session refresh should use useApiClient() hook directly
  return createBasicApiClient();
}

/**
 * Make a GET request to the API with session refresh
 * @param endpoint - The API endpoint to fetch from (without the /api/ prefix)
 * @param params - Query parameters to include in the URL
 * @returns The JSON response from the API
 */
export async function get<T>(endpoint: string, params?: Record<string, string | number | boolean>): Promise<T> {
  const apiClient = getApiClient();
  
  // Create a clean endpoint without any /api/ prefix
  const cleanEndpoint = endpoint.startsWith('/api/') ? endpoint.substring(5) : endpoint;
  
  // Add query parameters if provided
  let queryString = '';
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });
    queryString = searchParams.toString();
    if (queryString) {
      queryString = `?${queryString}`;
    }
  }
  
  // Combine the endpoint and query string
  const fullPath = cleanEndpoint + queryString;
  
  console.log(`[API Service] Making GET request to endpoint: ${fullPath}`);
  
  // The API client will add the /api/ prefix if needed
  const response = await apiClient.get<T>(fullPath);
  return response as T;
}

/**
 * Make a POST request to the API with session refresh
 * @param endpoint - The API endpoint to post to (without the /api/ prefix)
 * @param data - The data to send in the request body
 * @returns The JSON response from the API
 */
export async function post<T>(endpoint: string, data: Record<string, unknown>): Promise<T> {
  const apiClient = getApiClient();
  
  // Create a clean endpoint without any /api/ prefix
  const cleanEndpoint = endpoint.startsWith('/api/') ? endpoint.substring(5) : endpoint;
  
  console.log(`[API Service] Making POST request to endpoint: ${cleanEndpoint}`);
  
  // The API client will add the /api/ prefix if needed
  const response = await apiClient.post<T>(cleanEndpoint, data);
  return response as T;
}

/**
 * Make a PUT request to the API with session refresh
 * @param endpoint - The API endpoint to put to (without the /api/ prefix)
 * @param data - The data to send in the request body
 * @returns The JSON response from the API
 */
export async function put<T>(endpoint: string, data: Record<string, unknown>): Promise<T> {
  const apiClient = getApiClient();
  
  // Create a clean endpoint without any /api/ prefix
  const cleanEndpoint = endpoint.startsWith('/api/') ? endpoint.substring(5) : endpoint;
  
  console.log(`[API Service] Making PUT request to endpoint: ${cleanEndpoint}`);
  
  // The API client will add the /api/ prefix if needed
  const response = await apiClient.put<T>(cleanEndpoint, data);
  return response as T;
}

/**
 * Make a DELETE request to the API with session refresh
 * @param endpoint - The API endpoint to delete from (without the /api/ prefix)
 * @returns The JSON response from the API
 */
export async function del<T>(endpoint: string): Promise<T> {
  const apiClient = getApiClient();
  
  // Create a clean endpoint without any /api/ prefix
  const cleanEndpoint = endpoint.startsWith('/api/') ? endpoint.substring(5) : endpoint;
  
  console.log(`[API Service] Making DELETE request to endpoint: ${cleanEndpoint}`);
  
  // The API client will add the /api/ prefix if needed
  const response = await apiClient.delete<T>(cleanEndpoint);
  return response as T;
}
