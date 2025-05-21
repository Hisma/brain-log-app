'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, User, LogOut, ChevronDown, RefreshCw } from 'lucide-react';
import { ModeToggle } from '@/components/ui/modetoggle';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/AuthContext';
import { CurrentTime } from '@/components/current-time';
import { forceRefresh } from '@/lib/utils/refresh';
import { useRefreshCleanup } from '@/lib/hooks/useRefreshCleanup';
import { toast } from 'sonner';

export function Header() {
  const { user, isAuthenticated, logout, refreshSession } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Use the refresh cleanup hook
  useRefreshCleanup();
  
  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      // First try to refresh the session
      const success = await refreshSession();
      
      if (success) {
        toast.success('Session refreshed successfully');
      }
      
      // Then force a page refresh
      forceRefresh();
    } catch (error) {
      console.error('Error refreshing:', error);
      // Force a page refresh anyway
      forceRefresh();
    }
  };
  
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              Brain Log
            </Link>
            <div className="hidden md:block">
              <CurrentTime />
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
              Dashboard
            </Link>
            <Link href="/daily-log" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
              Daily Logs
            </Link>
            <Link href="/weekly-reflection" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
              Weekly Reflections
            </Link>
            <Link href="/insights" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
              Daily Insights
            </Link>
            <Link href="/weekly-insights" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
              Weekly Insights
            </Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Refresh page and session"
              aria-label="Refresh page and session"
            >
              <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <ModeToggle />
            
            {isAuthenticated ? (
              <div className="relative">
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2"
                  onClick={toggleUserMenu}
                >
                  <User className="h-5 w-5" />
                  <span className="hidden md:inline">{user?.displayName}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
                
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 border border-gray-200 dark:border-gray-700">
                    <Link 
                      href="/profile" 
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <button 
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                    >
                      <div className="flex items-center">
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </div>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">
                    Register
                  </Button>
                </Link>
              </div>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Toggle menu"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
