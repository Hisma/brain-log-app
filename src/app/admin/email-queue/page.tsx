'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, RefreshCw, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface EmailQueueItem {
  id: string;
  to: string;
  subject: string;
  template: string;
  status: 'pending' | 'sent' | 'failed';
  attempts: number;
  maxAttempts: number;
  error?: string;
  sentAt?: string;
  createdAt: string;
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'sent':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'failed':
      return <XCircle className="h-4 w-4 text-red-500" />;
    case 'pending':
      return <Clock className="h-4 w-4 text-yellow-500" />;
    default:
      return <AlertCircle className="h-4 w-4 text-gray-500" />;
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'sent':
      return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Sent</Badge>;
    case 'failed':
      return <Badge variant="destructive">Failed</Badge>;
    case 'pending':
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Pending</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
}

export default function EmailQueuePage() {
  const [emailQueue, setEmailQueue] = useState<EmailQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmailQueue = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/email-queue');
      
      if (!response.ok) {
        throw new Error('Failed to fetch email queue');
      }
      
      const data = await response.json();
      setEmailQueue(data.emails || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching email queue:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmailQueue();
  }, []);

  const handleRefresh = () => {
    fetchEmailQueue();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Email Queue</h1>
            <p className="text-gray-500 dark:text-gray-400">Manage email notifications and delivery status</p>
          </div>
        </div>
        
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Email Queue</h1>
            <p className="text-gray-500 dark:text-gray-400">Manage email notifications and delivery status</p>
          </div>
          <Button onClick={handleRefresh} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
        
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error Loading Email Queue</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
              <Button onClick={handleRefresh}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Email Queue</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage email notifications and delivery status</p>
        </div>
        <Button onClick={handleRefresh} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {emailQueue.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Emails in Queue</h3>
              <p className="text-gray-500 dark:text-gray-400">
                The email queue is currently empty. New emails will appear here when they are queued for delivery.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {emailQueue.map((email) => (
            <Card key={email.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(email.status)}
                    <CardTitle className="text-lg">{email.subject}</CardTitle>
                  </div>
                  {getStatusBadge(email.status)}
                </div>
                <CardDescription>
                  To: {email.to} • Template: {email.template}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-600 dark:text-gray-400">Created</p>
                    <p className="text-gray-900 dark:text-white">{formatDate(email.createdAt)}</p>
                  </div>
                  {email.sentAt && (
                    <div>
                      <p className="font-medium text-gray-600 dark:text-gray-400">Sent</p>
                      <p className="text-gray-900 dark:text-white">{formatDate(email.sentAt)}</p>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-600 dark:text-gray-400">Attempts</p>
                    <p className="text-gray-900 dark:text-white">{email.attempts} / {email.maxAttempts}</p>
                  </div>
                  {email.error && (
                    <div className="col-span-full">
                      <p className="font-medium text-red-600 dark:text-red-400">Error</p>
                      <p className="text-red-700 dark:text-red-300 text-xs mt-1">{email.error}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
