'use client';

import React, { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { updateUserProfile, updateUserPassword } from '@/lib/services/userService';
import { useSession } from 'next-auth/react';

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const { update: updateSession } = useSession();
  
  // Initialize all form state with empty strings to ensure inputs are always controlled
  const [displayName, setDisplayName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUserDataLoaded, setIsUserDataLoaded] = useState(false);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);
  
  // Update form state when user data is available
  useEffect(() => {
    if (user) {
      // Set displayName with fallback to empty string if undefined
      setDisplayName(user.displayName || '');
      setIsUserDataLoaded(true);
    }
  }, [user]);
  
  
  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setIsUpdating(true);
    setMessage('');
    setError('');
    
    try {
      // Update user record using the API
      const updatedUser = await updateUserProfile(user.id, { displayName });
      
      // Update the session with the new display name
      // This triggers the jwt callback with trigger="update"
      await updateSession({
        user: {
          ...user,
          name: displayName
        }
      });
      
      setMessage('Profile updated successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      console.error('Profile update error:', err);
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleUpdatePassword = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    // Validate passwords
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All password fields are required');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }
    
    setIsUpdating(true);
    setMessage('');
    setError('');
    
    try {
      // Update password using the API
      await updateUserPassword(user.id, currentPassword, newPassword);
      
      // Clear password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      setMessage('Password updated successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
      console.error('Password update error:', err);
    } finally {
      setIsUpdating(false);
    }
  };
  
  if (isLoading || !user || !isUserDataLoaded) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <p>Loading...</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
      
      {message && (
        <div className="mb-6 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">
          {message}
        </div>
      )}
      
      {error && (
        <div className="mb-6 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded">
          {error}
        </div>
      )}
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
        
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Username
            </label>
            <Input
              id="username"
              type="text"
              value={user?.username || ''}
              disabled
              className="bg-gray-100 dark:bg-gray-700"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Username cannot be changed
            </p>
          </div>
          
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Display Name
            </label>
            <Input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </div>
          
          <Button
            type="submit"
            disabled={isUpdating}
          >
            {isUpdating ? 'Updating...' : 'Update Profile'}
          </Button>
        </form>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Change Password</h2>
        
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Current Password
            </label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              New Password
            </label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirm New Password
            </label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          
          <Button
            type="submit"
            disabled={isUpdating}
          >
            {isUpdating ? 'Updating...' : 'Change Password'}
          </Button>
        </form>
      </div>
    </div>
  );
}
