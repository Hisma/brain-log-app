'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { Users, UserCheck, UserX, ShieldCheck, Database, Trash2 } from 'lucide-react';

interface User {
  id: number;
  username: string;
  displayName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  failedLoginAttempts: number;
}

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [actionLoading, setActionLoading] = useState<Record<number, string>>({});

  // Redirect to login if not authenticated or not admin
  React.useEffect(() => {
    if (!user) {
      router.push('/login');
    } else if (user.role !== 'ADMIN') {
      router.push('/');
    }
  }, [user, router]);

  // Load users on component mount
  useEffect(() => {
    if (user?.role === 'ADMIN') {
      loadUsers();
    }
  }, [user]);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users);
      } else {
        setMessage(`Error loading users: ${data.message}`);
      }
    } catch (error) {
      setMessage('Failed to load users');
      console.error(error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleApproveUser = async (userId: number) => {
    setActionLoading(prev => ({ ...prev, [userId]: 'approving' }));
    try {
      const response = await fetch('/api/admin/users/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      
      const data = await response.json();
      if (data.success) {
        setMessage(`User approved successfully`);
        loadUsers(); // Refresh users list
      } else {
        setMessage(`Error: ${data.message}`);
      }
    } catch (error) {
      setMessage('Failed to approve user');
      console.error(error);
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: '' }));
    }
  };

  const handleDeactivateUser = async (userId: number) => {
    setActionLoading(prev => ({ ...prev, [userId]: 'deactivating' }));
    try {
      const response = await fetch('/api/admin/users/deactivate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      
      const data = await response.json();
      if (data.success) {
        setMessage(`User deactivated successfully`);
        loadUsers(); // Refresh users list
      } else {
        setMessage(`Error: ${data.message}`);
      }
    } catch (error) {
      setMessage('Failed to deactivate user');
      console.error(error);
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: '' }));
    }
  };

  const handleMakeAdmin = async (userId: number) => {
    setActionLoading(prev => ({ ...prev, [userId]: 'promoting' }));
    try {
      const response = await fetch('/api/admin/users/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      
      const data = await response.json();
      if (data.success) {
        setMessage(`User promoted to admin successfully`);
        loadUsers(); // Refresh users list
      } else {
        setMessage(`Error: ${data.message}`);
      }
    } catch (error) {
      setMessage('Failed to promote user');
      console.error(error);
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: '' }));
    }
  };

  const handleCleanupOrphanedLogs = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/cleanup');
      const data = await response.json();
      
      if (data.success) {
        setMessage(data.message);
      } else {
        setMessage(`Error: ${data.message}`);
      }
    } catch (error) {
      setMessage('An error occurred while cleaning up orphaned logs.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'USER': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusBadgeColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  if (!user || user.role !== 'ADMIN') {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <ShieldCheck className="h-8 w-8" />
        Admin Dashboard
      </h1>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${message.includes('Error') || message.includes('Failed') ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}`}>
          {message}
        </div>
      )}
      
      {/* User Management */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingUsers ? (
            <div className="text-center py-4">Loading users...</div>
          ) : (
            <div className="space-y-4">
              {users.length === 0 ? (
                <p className="text-gray-500">No users found.</p>
              ) : (
                users.map((u) => (
                  <div key={u.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{u.displayName}</h3>
                        <Badge className={getRoleBadgeColor(u.role)}>
                          {u.role}
                        </Badge>
                        <Badge className={getStatusBadgeColor(u.isActive)}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        {u.failedLoginAttempts > 0 && (
                          <Badge variant="outline" className="text-orange-600">
                            {u.failedLoginAttempts} failed logins
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        @{u.username} • Created: {new Date(u.createdAt).toLocaleDateString()}
                        {u.lastLoginAt && ` • Last login: ${new Date(u.lastLoginAt).toLocaleDateString()}`}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      {u.role === 'PENDING' && (
                        <Button
                          size="sm"
                          onClick={() => handleApproveUser(u.id)}
                          disabled={!!actionLoading[u.id]}
                          className="flex items-center gap-1"
                        >
                          <UserCheck className="h-4 w-4" />
                          {actionLoading[u.id] === 'approving' ? 'Approving...' : 'Approve'}
                        </Button>
                      )}
                      
                      {u.role === 'USER' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMakeAdmin(u.id)}
                          disabled={!!actionLoading[u.id]}
                          className="flex items-center gap-1"
                        >
                          <ShieldCheck className="h-4 w-4" />
                          {actionLoading[u.id] === 'promoting' ? 'Promoting...' : 'Make Admin'}
                        </Button>
                      )}
                      
                      {u.isActive && u.id !== user.id && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeactivateUser(u.id)}
                          disabled={!!actionLoading[u.id]}
                          className="flex items-center gap-1"
                        >
                          <UserX className="h-4 w-4" />
                          {actionLoading[u.id] === 'deactivating' ? 'Deactivating...' : 'Deactivate'}
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Database Maintenance */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Maintenance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="mb-4">
                Clean up orphaned logs that are not associated with any user. 
                This is useful after implementing user authentication to remove logs 
                created before authentication was added.
              </p>
              <Button 
                onClick={handleCleanupOrphanedLogs} 
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                {isLoading ? 'Cleaning...' : 'Clean Up Orphaned Logs'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-6">
        <Button variant="outline" onClick={() => router.push('/')}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
