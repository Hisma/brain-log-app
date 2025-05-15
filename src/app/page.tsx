'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { dailyLogService, DailyLog } from '@/lib/services/dailyLogService';
import { weeklyReflectionService, WeeklyReflection } from '@/lib/services/weeklyReflectionService';
import { formatDate } from '@/lib/utils/index';
import { useAuth } from '@/lib/auth/AuthContext';

export default function HomePage() {
  const { user } = useAuth();
  const [recentDailyLogs, setRecentDailyLogs] = useState<DailyLog[]>([]);
  const [recentWeeklyReflections, setRecentWeeklyReflections] = useState<WeeklyReflection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch data when component mounts or user changes
  useEffect(() => {
    async function fetchData() {
      if (user) {
        try {
          setIsLoading(true);
          const dailyLogs = await dailyLogService.getRecent(user.id, 3);
          const weeklyReflections = await weeklyReflectionService.getRecent(user.id, 1);
          
          setRecentDailyLogs(dailyLogs);
          setRecentWeeklyReflections(weeklyReflections);
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setRecentDailyLogs([]);
        setRecentWeeklyReflections([]);
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [user]);
  
  // Check if today's log exists
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayLog = recentDailyLogs.find(log => {
    const logDate = new Date(log.date);
    logDate.setHours(0, 0, 0, 0);
    return logDate.getTime() === today.getTime();
  });

  return (
    <div className="flex flex-col space-y-8 animate-fade-in">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-4">
          {user ? `Welcome back, ${user.displayName}` : 'Welcome to Brain Log'}
        </h1>
        <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
          Your personal daily log for tracking mood, focus, and mental well-being.
        </p>
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
                Daily Log
              </h2>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800/30 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              {todayLog 
                ? "You've already started today's log. Continue where you left off."
                : "Track your mood, sleep quality, and daily reflections."}
            </p>
            <Link href="/daily-log">
              <Button className="w-full">
                {todayLog ? "Continue Today's Log" : "Start Today's Log"}
              </Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
                Weekly Reflection
              </h2>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-800/30 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Reflect on your week, identify patterns, and set intentions for the coming week.
            </p>
            <Link href="/weekly-reflection">
              <Button className="w-full">
                Weekly Reflection
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
      
      {/* Dashboard Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Daily Logs</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="p-8 text-center">
                <p className="text-gray-600 dark:text-gray-400">Loading...</p>
              </div>
            ) : recentDailyLogs.length > 0 ? (
              <div className="space-y-4">
                {recentDailyLogs.map((log) => (
                  <Link href={`/daily-log?date=${new Date(log.date).toISOString()}`} key={log.id} className="block">
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          {formatDate(new Date(log.date))}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          log.morningMood >= 8 ? 'bg-green-100 text-green-800' :
                          log.morningMood >= 5 ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          Mood: {log.morningMood}/10
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                        <div>
                          <span className="font-medium">Sleep:</span> {log.sleepHours}h ({log.sleepQuality}/10)
                        </div>
                        <div>
                          <span className="font-medium">Status:</span> {log.isComplete ? 'Complete' : 'In Progress'}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
                <div className="text-center mt-4">
                  <Link href="/daily-log">
                    <Button variant="outline" size="sm">
                      View All Logs
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-8 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-4">No daily logs found</p>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  Start tracking your daily experiences to build insights over time.
                </p>
                <Link href="/daily-log">
                  <Button>
                    Create Your First Log
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Link href="/insights" className="block">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">Insights Dashboard</h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300">View trends and patterns</p>
                    </div>
                  </div>
                </div>
              </Link>
              
              <Link href="/weekly-reflection" className="block">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">Weekly Reflections</h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300">Review your progress</p>
                    </div>
                  </div>
                </div>
              </Link>
              
              {recentWeeklyReflections.length > 0 && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Latest Weekly Reflection</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Week Rating: {recentWeeklyReflections[0].weekRating}/10
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Mental State: {recentWeeklyReflections[0].mentalState}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Why Track Section */}
      <Card>
        <CardHeader>
          <CardTitle>Why Track Your Mental Well-being?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mb-3">
                <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">Identify Patterns</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Recognize triggers and patterns that affect your mood and focus.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mb-3">
                <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">Track Progress</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Monitor how your mental well-being changes over time.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mb-3">
                <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">Gain Insights</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Discover what helps and what hinders your mental health.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
