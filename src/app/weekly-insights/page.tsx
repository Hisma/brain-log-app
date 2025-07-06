'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { WeeklyInsightCard } from '@/components/ui/weekly-insight-card';

interface WeeklyReflection {
  id: number;
  weekStartDate: string;
  weekEndDate: string;
}

interface WeeklyInsight {
  id: number;
  weeklyReflectionId: number;
  insightText: string;
  createdAt: string;
  weeklyReflection: {
    weekStartDate: string;
    weekEndDate: string;
    weekRating: number;
  };
}

export default function WeeklyInsightsPage() {
  const [weeklyReflections, setWeeklyReflections] = useState<WeeklyReflection[]>([]);
  const [weeklyInsights, setWeeklyInsights] = useState<WeeklyInsight[]>([]);
  const [selectedReflectionId, setSelectedReflectionId] = useState<string>('');
  const [currentInsight, setCurrentInsight] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Fetch weekly reflections
  useEffect(() => {
    const fetchWeeklyReflections = async () => {
      try {
        const response = await fetch('/api/weekly-reflections');
        if (!response.ok) {
          throw new Error('Failed to fetch weekly reflections');
        }
        const data = await response.json();
        
        // Sort by date (newest first)
        const sortedReflections = data.sort((a: WeeklyReflection, b: WeeklyReflection) => 
          new Date(b.weekEndDate).getTime() - new Date(a.weekEndDate).getTime()
        );
        
        setWeeklyReflections(sortedReflections);
        
        // If there are reflections, select the most recent one by default
        if (sortedReflections.length > 0) {
          setSelectedReflectionId(sortedReflections[0].id.toString());
        }
      } catch (error) {
        console.error('Error fetching weekly reflections:', error);
        setError('Failed to load weekly reflections. Please try again later.');
      }
    };

    fetchWeeklyReflections();
  }, []);

  // Fetch weekly insights
  useEffect(() => {
    const fetchWeeklyInsights = async () => {
      try {
        const response = await fetch('/api/weekly-insights');
        if (!response.ok) {
          throw new Error('Failed to fetch weekly insights');
        }
        const data = await response.json();
        setWeeklyInsights(data.weeklyInsights || []);
      } catch (error) {
        console.error('Error fetching weekly insights:', error);
        setError('Failed to load weekly insights. Please try again later.');
      }
    };

    fetchWeeklyInsights();
  }, []);

  // Fetch insight for selected weekly reflection
  useEffect(() => {
    if (!selectedReflectionId) return;

    const fetchInsight = async () => {
      setIsLoading(true);
      setCurrentInsight('');
      try {
        const response = await fetch(`/api/weekly-insights?weeklyReflectionId=${selectedReflectionId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch weekly insight');
        }
        const data = await response.json();
        setCurrentInsight(data.insightText || '');
      } catch (error) {
        console.error('Error fetching weekly insight:', error);
        setError('Failed to load weekly insight. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsight();
  }, [selectedReflectionId]);

  // Generate insight for selected weekly reflection
  const handleGenerateInsight = async () => {
    if (!selectedReflectionId) return;

    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/weekly-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ weeklyReflectionId: parseInt(selectedReflectionId) }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate weekly insight');
      }

      const data = await response.json();
      setCurrentInsight(data.insightText);
      
      // Refresh insights list
      const insightsResponse = await fetch('/api/weekly-insights');
      if (insightsResponse.ok) {
        const insightsData = await insightsResponse.json();
        setWeeklyInsights(insightsData.weeklyInsights || []);
      }
    } catch (error) {
      console.error('Error generating weekly insight:', error);
      setError('Failed to generate weekly insight. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Find the selected weekly reflection
  const selectedReflection = weeklyReflections.find(reflection => reflection.id.toString() === selectedReflectionId);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Weekly AI Insights</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left sidebar - Weekly reflection selector */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Select Weekly Reflection</CardTitle>
              <CardDescription>
                Choose a weekly reflection to view AI insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              {weeklyReflections.length > 0 ? (
                <Select
                  value={selectedReflectionId}
                  onValueChange={setSelectedReflectionId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a weekly reflection" />
                  </SelectTrigger>
                  <SelectContent>
                    {weeklyReflections.map((reflection) => (
                      <SelectItem key={reflection.id} value={reflection.id.toString()}>
                        {format(new Date(reflection.weekStartDate), "MMM d")} - {format(new Date(reflection.weekEndDate), "MMM d, yyyy")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-muted-foreground">
                  No weekly reflections found. Complete a weekly reflection to generate insights.
                </p>
              )}
              
              <div className="mt-6">
                <h3 className="font-medium mb-2">Recent Insights</h3>
                {weeklyInsights.length > 0 ? (
                  <ul className="space-y-2">
                    {weeklyInsights.slice(0, 5).map((insight) => (
                      <li key={insight.id}>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-left"
                          onClick={() => setSelectedReflectionId(insight.weeklyReflectionId.toString())}
                        >
                          {format(new Date(insight.weeklyReflection.weekStartDate), "MMM d")} - {format(new Date(insight.weeklyReflection.weekEndDate), "MMM d, yyyy")}
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No weekly insights generated yet.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main content - Insight display */}
        <div className="md:col-span-2">
          {selectedReflection ? (
            <WeeklyInsightCard
              weekStartDate={new Date(selectedReflection.weekStartDate)}
              weekEndDate={new Date(selectedReflection.weekEndDate)}
              insightText={currentInsight}
              onGenerateInsight={handleGenerateInsight}
              isLoading={isLoading}
            />
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">
                  Select a weekly reflection to view or generate insights.
                </p>
              </CardContent>
            </Card>
          )}
          
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">About Weekly AI Insights</h2>
            <Card>
              <CardContent className="py-6">
                <p className="mb-4">
                  Weekly AI Insights analyzes your weekly reflection data to provide personalized observations, patterns, and recommendations.
                </p>
                <p className="mb-4">
                  The AI looks for trends across your week, identifying connections between your activities, habits, and overall well-being.
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
