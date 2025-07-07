'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  UserCheck, 
  ShieldCheck, 
  Activity, 
  TrendingUp,
  Clock,
  AlertTriangle,
  type LucideIcon
} from 'lucide-react';

interface DashboardStats {
  pendingUsers: number;
  activeUsers: number;
  totalUsers: number;
  recentActivity: number;
  pendingEmails: number;
  adminUsers: number;
}

interface RecentUser {
  id: number;
  username: string;
  displayName: string;
  role: string;
  createdAt: string;
  isActive?: boolean;
}

interface User {
  id: number;
  username: string;
  displayName: string;
  role: string;
  createdAt: string;
  isActive: boolean;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    pendingUsers: 0,
    activeUsers: 0,
    totalUsers: 0,
    recentActivity: 0,
    pendingEmails: 0,
    adminUsers: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [loadingRecentUsers, setLoadingRecentUsers] = useState(true);

  // Redirect to login if not authenticated or not admin
  React.useEffect(() => {
    if (!user) {
      router.push('/login');
    } else if (user.role !== 'ADMIN') {
      router.push('/');
    }
  }, [user, router]);

  // Load dashboard data on component mount
  useEffect(() => {
    if (user?.role === 'ADMIN') {
      loadDashboardStats();
      loadRecentUsers();
    }
  }, [user]);

  const loadDashboardStats = async () => {
    try {
      setLoadingStats(true);
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      
      if (data.success) {
        const users: User[] = data.users;
        setDashboardStats({
          pendingUsers: users.filter((u: User) => u.role === 'PENDING').length,
          activeUsers: users.filter((u: User) => u.role === 'USER' && u.isActive).length,
          totalUsers: users.length,
          adminUsers: users.filter((u: User) => u.role === 'ADMIN').length,
          recentActivity: 0, // Would come from audit logs
          pendingEmails: 0   // Would come from email queue
        });
      } else {
        setMessage(`Error loading dashboard stats: ${data.message}`);
      }
    } catch (error) {
      setMessage('Failed to load dashboard statistics');
      console.error(error);
    } finally {
      setLoadingStats(false);
    }
  };

  const loadRecentUsers = async () => {
    try {
      setLoadingRecentUsers(true);
      const response = await fetch('/api/admin/users?limit=5');
      const data = await response.json();
      
      if (data.success) {
        setRecentUsers(data.users.slice(0, 5));
      } else {
        setMessage(`Error loading recent users: ${data.message}`);
      }
    } catch (error) {
      setMessage('Failed to load recent users');
      console.error(error);
    } finally {
      setLoadingRecentUsers(false);
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

  const StatCard = ({ title, value, icon: Icon, description, color = "blue" }: {
    title: string;
    value: number;
    icon: LucideIcon;
    description: string;
    color?: string;
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          <div className={`p-3 rounded-full bg-${color}-100 dark:bg-${color}-900`}>
            <Icon className={`h-6 w-6 text-${color}-600 dark:text-${color}-400`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (!user || user.role !== 'ADMIN') {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <ShieldCheck className="h-8 w-8" />
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome back, {user.displayName}. Here&apos;s what&apos;s happening with your application.
        </p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.includes('Error') || message.includes('Failed') ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}`}>
          {message}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loadingStats ? (
          <div className="col-span-full text-center py-4">Loading statistics...</div>
        ) : (
          <>
            <StatCard
              title="Pending Users"
              value={dashboardStats.pendingUsers}
              icon={UserCheck}
              description="Awaiting approval"
              color="yellow"
            />
            <StatCard
              title="Active Users"
              value={dashboardStats.activeUsers}
              icon={Users}
              description="Currently active"
              color="green"
            />
            <StatCard
              title="Total Users"
              value={dashboardStats.totalUsers}
              icon={TrendingUp}
              description="All registered users"
              color="blue"
            />
            <StatCard
              title="Admin Users"
              value={dashboardStats.adminUsers}
              icon={ShieldCheck}
              description="System administrators"
              color="red"
            />
          </>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Registrations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Registrations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingRecentUsers ? (
              <div className="text-center py-4">Loading recent users...</div>
            ) : (
              <div className="space-y-3">
                {recentUsers.length === 0 ? (
                  <p className="text-gray-500">No recent registrations.</p>
                ) : (
                  recentUsers.map((u) => (
                    <div key={u.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{u.displayName}</p>
                        <p className="text-sm text-gray-500">@{u.username}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getRoleBadgeColor(u.role)}>
                          {u.role}
                        </Badge>
                        <span className="text-xs text-gray-400">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Database Connection</span>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Online
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Email Service</span>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Online
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Registration</span>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Enabled
                </Badge>
              </div>
              {dashboardStats.pendingUsers > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Pending Approvals</span>
                  <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    {dashboardStats.pendingUsers} waiting
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      {dashboardStats.pendingUsers > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div>
                <h3 className="font-medium">Pending User Approvals</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {dashboardStats.pendingUsers} user{dashboardStats.pendingUsers !== 1 ? 's' : ''} waiting for approval
                </p>
              </div>
              <button
                onClick={() => router.push('/admin/users')}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
              >
                Review Users
              </button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
