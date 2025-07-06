'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DailyInsightCard } from '@/components/ui/daily-insight-card';

interface DailyLog {
  id: number;
  date: string;
  isComplete: boolean;
}

interface Insight {
  id: number;
  dailyLogId: number;
  insightText: string;
  createdAt: string;
  dailyLog: {
    date: string;
  };
}

export default function InsightsPage() {
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [selectedLogId, setSelectedLogId] = useState<string>('');
  const [currentInsight, setCurrentInsight] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Fetch daily logs
  useEffect(() => {
    const fetchDailyLogs = async () => {
      try {
        const response = await fetch('/api/daily-logs');
        if (!response.ok) {
          throw new Error('Failed to fetch daily logs');
        }
        const data = await response.json();
        // Sort by date (newest first) and filter for completed logs
        const sortedLogs = data.dailyLogs
          .filter((log: DailyLog) => log.isComplete)
          .sort((a: DailyLog, b: DailyLog) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
        setDailyLogs(sortedLogs);
        
        // If there are logs, select the most recent one by default
        if (sortedLogs.length > 0) {
          setSelectedLogId(sortedLogs[0].id.toString());
        }
      } catch (error) {
        console.error('Error fetching daily logs:', error);
        setError('Failed to load daily logs. Please try again later.');
      }
    };

    fetchDailyLogs();
  }, []);

  // Fetch insights
  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await fetch('/api/insights');
        if (!response.ok) {
          throw new Error('Failed to fetch insights');
        }
        const data = await response.json();
        setInsights(data.insights || []);
      } catch (error) {
        console.error('Error fetching insights:', error);
        setError('Failed to load insights. Please try again later.');
      }
    };

    fetchInsights();
  }, []);

  // Fetch insight for selected log
  useEffect(() => {
    if (!selectedLogId) return;

    const fetchInsight = async () => {
      setIsLoading(true);
      setCurrentInsight('');
      try {
        const response = await fetch(`/api/insights?dailyLogId=${selectedLogId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch insight');
        }
        const data = await response.json();
        setCurrentInsight(data.insightText || '');
      } catch (error) {
        console.error('Error fetching insight:', error);
        setError('Failed to load insight. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsight();
  }, [selectedLogId]);

  // Generate insight for selected log
  const handleGenerateInsight = async () => {
    if (!selectedLogId) return;

    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dailyLogId: parseInt(selectedLogId) }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate insight');
      }

      const data = await response.json();
      setCurrentInsight(data.insightText);
      
      // Refresh insights list
      const insightsResponse = await fetch('/api/insights');
      if (insightsResponse.ok) {
        const insightsData = await insightsResponse.json();
        setInsights(insightsData.insights || []);
      }
    } catch (error) {
      console.error('Error generating insight:', error);
      setError('Failed to generate insight. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Find the selected daily log
  const selectedLog = dailyLogs.find(log => log.id.toString() === selectedLogId);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Daily AI Insights</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left sidebar - Daily log selector */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Select Daily Log</CardTitle>
              <CardDescription>
                Choose a completed daily log to view AI insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dailyLogs.length > 0 ? (
                <Select
                  value={selectedLogId}
                  onValueChange={setSelectedLogId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a daily log" />
                  </SelectTrigger>
                  <SelectContent>
                    {dailyLogs.map((log) => (
                      <SelectItem key={log.id} value={log.id.toString()}>
                        {format(new Date(log.date), 'MMM d, yyyy')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-muted-foreground">
                  No completed daily logs found. Complete a daily log to generate insights.
                </p>
              )}
              
              <div className="mt-6">
                <h3 className="font-medium mb-2">Recent Insights</h3>
                {insights.length > 0 ? (
                  <ul className="space-y-2">
                    {insights.slice(0, 5).map((insight) => (
                      <li key={insight.id}>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-left"
                          onClick={() => setSelectedLogId(insight.dailyLogId.toString())}
                        >
                          {format(new Date(insight.dailyLog.date), 'MMM d, yyyy')}
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No insights generated yet.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main content - Insight display */}
        <div className="md:col-span-2">
          {selectedLog ? (
            <DailyInsightCard
              dailyLogId={parseInt(selectedLogId)}
              date={new Date(selectedLog.date)}
              insightText={currentInsight}
              onGenerateInsight={handleGenerateInsight}
              isLoading={isLoading}
            />
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">
                  Select a daily log to view or generate insights.
                </p>
              </CardContent>
            </Card>
          )}
          
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">About AI Insights</h2>
            <Card>
              <CardContent className="py-6">
                <p className="mb-4">
                  AI Insights analyzes your daily log data to provide personalized observations, patterns, and recommendations.
                </p>
                <p className="mb-4">
                  The AI looks for connections between your sleep, medication, mood, and productivity to help you understand what factors influence your well-being.
                </p>
                <p>
                  Insights are generated using advanced AI technology and are meant to complement your own self-reflection, not replace professional medical advice.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
