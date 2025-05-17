'use client';

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getCommonTimezones } from '@/lib/utils/timezone';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [timezone, setTimezone] = useState('America/New_York');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const timezones = getCommonTimezones();
  
  const { register, isAuthenticated } = useAuth();
  const router = useRouter();
  
  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!username || !password || !confirmPassword || !displayName) {
      setError('All fields are required');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const success = await register({
        username,
        password,
        displayName,
        timezone
      });
      
      if (success) {
        router.push('/');
      } else {
        setError('Username already exists. Please choose another one.');
      }
    } catch (err) {
      setError('An error occurred during registration. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Create Account</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Sign up for a new Brain Log account
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-100 dark:bg-red-900/30 dark:text-red-300 rounded">
              {error}
            </div>
          )}
          
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Display Name
            </label>
            <Input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1"
              placeholder="Enter your name"
              required
            />
          </div>
          
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Username
            </label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1"
              placeholder="Choose a username"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1"
              placeholder="Create a password"
              required
            />
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Confirm Password
            </label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1"
              placeholder="Confirm your password"
              required
            />
          </div>
          
          <div>
            <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Timezone
            </label>
            <Select
              value={timezone}
              onValueChange={setTimezone}
            >
              <SelectTrigger id="timezone" className="mt-1">
                <SelectValue placeholder="Select your timezone" />
              </SelectTrigger>
              <SelectContent>
                {timezones.map((tz) => (
                  <SelectItem key={tz.id} value={tz.id}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              Your timezone is used to ensure daily logs are created for the correct day.
            </p>
          </div>
          
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
          
          <div className="text-center text-sm">
            <p className="text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
