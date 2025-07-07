'use client';

import React, { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface LockoutInfo {
  isLockedOut: boolean;
  failedAttempts: number;
  lockoutUntil?: string;
  remainingTime?: number;
}

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lockoutInfo, setLockoutInfo] = useState<LockoutInfo | null>(null);
  const [remainingTime, setRemainingTime] = useState<number>(0);
  
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();
  
  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  // Check lockout status when username changes
  useEffect(() => {
    const checkLockoutStatus = async () => {
      if (!username.trim()) {
        setLockoutInfo(null);
        return;
      }

      try {
        const response = await fetch('/api/auth/lockout-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: username.trim() })
        });

        if (response.ok) {
          const data = await response.json();
          setLockoutInfo(data);
          
          if (data.isLockedOut && data.remainingTime) {
            setRemainingTime(data.remainingTime);
          }
        }
      } catch (error) {
        // Silently fail - don't show lockout errors if API isn't available
        console.error('Lockout check error:', error);
      }
    };

    // Debounce the lockout check
    const timeoutId = setTimeout(checkLockoutStatus, 500);
    return () => clearTimeout(timeoutId);
  }, [username]);

  // Countdown timer for lockout
  useEffect(() => {
    if (remainingTime <= 0) return;

    const timer = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          // Lockout expired, refresh lockout info
          setLockoutInfo(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [remainingTime]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      const msg = 'Please enter both username and password';
      toast.error(msg);
      return;
    }

    if (lockoutInfo?.isLockedOut) {
      const msg = 'Account is temporarily locked. Please wait before trying again.';
      toast.error(msg);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await login(username, password);
      
      console.log('Login attempt result:', success);
      
      if (success) {
        toast.success('Login successful! Redirecting...');
        
        // Add a small delay before redirecting to ensure the session is fully updated
        // This is especially important in Edge Runtime environments
        console.log('Login successful, waiting for session to update before redirecting...');
        
        // Wait for session to be fully established
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Force a hard navigation instead of client-side navigation
        // This ensures the page is fully reloaded with the new session
        window.location.href = '/';
      } else {
        console.log('Login failed, checking lockout status...');
        
        // Refresh lockout info after failed attempt
        if (username.trim()) {
          try {
            const response = await fetch('/api/auth/lockout-status', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username: username.trim() })
            });

            if (response.ok) {
              const data = await response.json();
              setLockoutInfo(data);
              
              if (data.isLockedOut && data.remainingTime) {
                setRemainingTime(data.remainingTime);
                const msg = `Too many failed attempts. Account locked for ${formatTime(data.remainingTime)}.`;
                toast.error(msg);
              } else {
                const attemptsRemaining = 5 - (data.failedAttempts || 0);
                const msg = `Invalid username or password. ${attemptsRemaining} attempts remaining before lockout.`;
                toast.error(msg);
              }
            } else {
              const msg = 'Invalid username or password.';
              toast.error(msg);
            }
          } catch (err) {
            console.error('Lockout check error:', err);
            const msg = 'Invalid username or password.';
            toast.error(msg);
          }
        } else {
          const msg = 'Invalid username or password.';
          toast.error(msg);
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      const msg = 'An error occurred during login. Please try again.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Sign in to your Brain Log account
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Username or Email
            </label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`mt-1 ${lockoutInfo?.isLockedOut ? 'opacity-50' : ''}`}
              placeholder="Enter your username or email"
              disabled={lockoutInfo?.isLockedOut}
              autoComplete="username"
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
              className={`mt-1 ${lockoutInfo?.isLockedOut ? 'opacity-50' : ''}`}
              placeholder="Enter your password"
              disabled={lockoutInfo?.isLockedOut}
              autoComplete="current-password"
              required
            />
          </div>
          
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
          
          <div className="text-center text-sm">
            <p className="text-gray-600 dark:text-gray-400">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-blue-600 dark:text-blue-400 hover:underline">
                Register here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
