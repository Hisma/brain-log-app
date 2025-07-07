'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { Settings, Save } from 'lucide-react';

interface SystemSettings {
  registrationEnabled: boolean;
  maintenanceMode: boolean;
  siteName: string;
  adminEmail: string;
  maxFailedLogins: number;
  lockoutDurationMinutes: number;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    registrationEnabled: true,
    maintenanceMode: false,
    siteName: 'Brain Log App',
    adminEmail: 'admin@brainlogapp.com',
    maxFailedLogins: 5,
    lockoutDurationMinutes: 15
  });
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  // Redirect to login if not authenticated or not admin
  React.useEffect(() => {
    if (!user) {
      router.push('/login');
    } else if (user.role !== 'ADMIN') {
      router.push('/');
    }
  }, [user, router]);

  // Load settings on component mount
  useEffect(() => {
    if (user?.role === 'ADMIN') {
      loadSystemSettings();
    }
  }, [user]);

  const loadSystemSettings = async () => {
    try {
      setLoadingSettings(true);
      const response = await fetch('/api/system/settings');
      const data = await response.json();
      
      if (response.ok) {
        setSystemSettings(data);
      } else {
        setMessage(`Error loading system settings: ${data.message}`);
      }
    } catch (error) {
      setMessage('Failed to load system settings');
      console.error(error);
    } finally {
      setLoadingSettings(false);
    }
  };

  const saveSystemSettings = async () => {
    try {
      setSavingSettings(true);
      setMessage(null);
      const response = await fetch('/api/system/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(systemSettings)
      });
      
      const data = await response.json();
      if (data.success) {
        setMessage('System settings saved successfully');
      } else {
        setMessage(`Error saving settings: ${data.message}`);
      }
    } catch (error) {
      setMessage('Failed to save system settings');
      console.error(error);
    } finally {
      setSavingSettings(false);
    }
  };

  if (!user || user.role !== 'ADMIN') {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="h-8 w-8" />
          System Settings
        </h1>
        <p className="text-muted-foreground">
          Configure system-wide settings and security policies.
        </p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.includes('Error') || message.includes('Failed') ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}`}>
          {message}
        </div>
      )}

      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Application Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingSettings ? (
            <div className="text-center py-4">Loading system settings...</div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Site Name</label>
                  <Input
                    value={systemSettings.siteName}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, siteName: e.target.value }))}
                    placeholder="Brain Log App"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    The name that appears in the application header
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Admin Email</label>
                  <Input
                    type="email"
                    value={systemSettings.adminEmail}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, adminEmail: e.target.value }))}
                    placeholder="admin@brainlogapp.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Email address to receive admin notifications
                  </p>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Security Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Max Failed Logins</label>
                    <Input
                      type="number"
                      min="1"
                      max="20"
                      value={systemSettings.maxFailedLogins}
                      onChange={(e) => setSystemSettings(prev => ({ ...prev, maxFailedLogins: parseInt(e.target.value) || 5 }))}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Number of failed login attempts before account lockout (1-20)
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Lockout Duration (minutes)</label>
                    <Input
                      type="number"
                      min="1"
                      max="1440"
                      value={systemSettings.lockoutDurationMinutes}
                      onChange={(e) => setSystemSettings(prev => ({ ...prev, lockoutDurationMinutes: parseInt(e.target.value) || 15 }))}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      How long to lock accounts after failed attempts (1-1440 minutes)
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">System Control</h3>
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={systemSettings.maintenanceMode}
                        onChange={(e) => setSystemSettings(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
                        className="rounded"
                      />
                      <span className="text-sm font-medium">Maintenance Mode</span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1 ml-6">
                      When enabled, only admins can access the application
                    </p>
                  </div>
                  
                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={systemSettings.registrationEnabled}
                        onChange={(e) => setSystemSettings(prev => ({ ...prev, registrationEnabled: e.target.checked }))}
                        className="rounded"
                      />
                      <span className="text-sm font-medium">Enable User Registration</span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1 ml-6">
                      When disabled, new users cannot register and will need admin approval
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-6">
                <Button
                  onClick={saveSystemSettings}
                  disabled={savingSettings}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {savingSettings ? 'Saving...' : 'Save Settings'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
