import { get, put } from './api';

/**
 * User service for interacting with the user API endpoints
 */

export interface User {
  id: number;
  username: string;
  displayName: string;
  theme: string;
  createdAt: string;
  lastLogin?: string;
}

/**
 * Get a user by ID
 * @param userId - The ID of the user to get
 * @returns The user object
 */
export async function getUser(userId: number): Promise<User> {
  return get<User>(`users/${userId}`);
}

/**
 * Update a user's profile information
 * @param userId - The ID of the user to update
 * @param data - The data to update
 * @returns The updated user object
 */
export async function updateUserProfile(userId: number, data: { displayName?: string; theme?: string }): Promise<User> {
  return put<User>(`users/${userId}`, data);
}

/**
 * Update a user's password
 * @param userId - The ID of the user to update
 * @param currentPassword - The current password
 * @param newPassword - The new password
 * @returns The updated user object
 */
export async function updateUserPassword(
  userId: number,
  currentPassword: string,
  newPassword: string
): Promise<User> {
  return put<User>(`users/${userId}`, {
    currentPassword,
    newPassword
  });
}
