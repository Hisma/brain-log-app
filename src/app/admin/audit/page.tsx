'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { FileText, Search, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

// Use the same interface as your audit system
interface AuditEntry {
  id: number;
  action: string;
  resourceType: string;
  resourceId: string | null;
  userId: number | null;
  userName: string;
  details: Record<string, unknown>;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  success: boolean;
}

export default function AuditPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredLogs, setFilteredLogs] = useState<AuditEntry[]>([]);

  // Redirect to login if not authenticated or not admin
  React.useEffect(() => {
    if (!user) {
      router.push('/login');
    } else if (user.role !== 'ADMIN') {
      router.push('/');
    }
  }, [user, router]);

  // Load audit logs on component mount
  useEffect(() => {
    if (user?.role === 'ADMIN') {
      loadAuditLogs();
    }
  }, [user]);

  // Filter logs based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredLogs(auditLogs);
    } else {
      const filtered = auditLogs.filter(log => 
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.resourceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.ipAddress && log.ipAddress.includes(searchTerm))
      );
      setFilteredLogs(filtered);
    }
  }, [auditLogs, searchTerm]);

  const loadAuditLogs = async () => {
    try {
      setLoadingLogs(true);
      const response = await fetch('/api/admin/audit');
      const data = await response.json();
      
      if (data.success) {
        setAuditLogs(data.logs);
      } else {
        setMessage(`Error loading audit logs: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      setMessage('Failed to load audit logs');
      console.error(error);
    } finally {
      setLoadingLogs(false);
    }
  };

  const getActionIcon = (action: string, success: boolean) => {
    if (!success) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    
    if (action.includes('DELETE') || action.includes('DEACTIVATE')) {
      return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    }
    
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const getActionBadgeColor = (action: string, success: boolean) => {
    if (!success) {
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    }
    
    if (action.includes('CREATE') || action.includes('APPROVE')) {
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    } else if (action.includes('UPDATE') || action.includes('MODIFY')) {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    } else if (action.includes('DELETE') || action.includes('DEACTIVATE')) {
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    }
    
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  if (!user || user.role !== 'ADMIN') {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <FileText className="h-8 w-8" />
          Audit Log
        </h1>
        <p className="text-muted-foreground">
          Review system activity and user actions for security monitoring.
        </p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.includes('Error') || message.includes('Failed') ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}`}>
          {message}
        </div>
      )}

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Audit Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by action, resource, user, or IP address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Audit Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent Activity ({filteredLogs.length} entries)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingLogs ? (
            <div className="text-center py-4">Loading audit logs...</div>
          ) : (
            <div className="space-y-4">
              {filteredLogs.length === 0 ? (
                <p className="text-gray-500">
                  {searchTerm ? 'No audit logs found matching your search.' : 'No audit logs found.'}
                </p>
              ) : (
                filteredLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 p-4 border rounded-lg">
                    {getActionIcon(log.action, log.success)}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getActionBadgeColor(log.action, log.success)}>
                          {log.action}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {log.resourceType}
                          {log.resourceId && ` #${log.resourceId}`}
                        </span>
                      </div>
                      
                      <div className="text-sm">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {log.userName}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          {new Date(log.createdAt).toLocaleString()}
                          {log.ipAddress && ` • IP: ${log.ipAddress}`}
                        </p>
                        
                        {Object.keys(log.details).length > 0 && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700">
                              View Details
                            </summary>
                            <pre className="mt-1 text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded overflow-x-auto">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
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
