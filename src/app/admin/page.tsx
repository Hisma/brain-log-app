'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

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

  if (!user) {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Database Maintenance</CardTitle>
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
              >
                {isLoading ? 'Cleaning...' : 'Clean Up Orphaned Logs'}
              </Button>
              
              {message && (
                <div className={`mt-4 p-3 rounded ${message.includes('Error') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                  {message}
                </div>
              )}
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
