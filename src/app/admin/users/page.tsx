'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { Users, UserCheck, UserX, ShieldCheck, Search } from 'lucide-react';

interface User {
  id: number;
  username: string;
  email: string | null;
  displayName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  failedLoginAttempts: number;
}

export default function UsersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [actionLoading, setActionLoading] = useState<Record<number, string>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

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

  // Filter users based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(u => 
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredUsers(filtered);
    }
  }, [users, searchTerm]);

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Users className="h-8 w-8" />
          User Management
        </h1>
        <p className="text-muted-foreground">
          Manage user accounts, approvals, and permissions.
        </p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.includes('Error') || message.includes('Failed') ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}`}>
          {message}
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by username, display name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardContent>
      </Card>
      
      {/* User Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            All Users ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingUsers ? (
            <div className="text-center py-4">Loading users...</div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.length === 0 ? (
                <p className="text-gray-500">
                  {searchTerm ? 'No users found matching your search.' : 'No users found.'}
                </p>
              ) : (
                filteredUsers.map((u) => (
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
                        @{u.username}{u.email && ` • ${u.email}`} • Created: {new Date(u.createdAt).toLocaleDateString()}
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
    </div>
  );
}
