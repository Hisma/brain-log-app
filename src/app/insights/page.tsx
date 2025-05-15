"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { dailyLogService, DailyLog } from "@/lib/services/dailyLogService";
import { weeklyReflectionService, WeeklyReflection } from "@/lib/services/weeklyReflectionService";
import { MoodTrendChart, prepareMoodTrendData } from "@/components/charts/MoodTrendChart";
import { SleepQualityChart, prepareSleepQualityData } from "@/components/charts/SleepQualityChart";
import { FocusEnergyChart, prepareFocusEnergyData } from "@/components/charts/FocusEnergyChart";
import { WeeklyInsightsChart, prepareWeeklyInsightsData } from "@/components/charts/WeeklyInsightsChart";

export default function InsightsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [weeklyReflections, setWeeklyReflections] = useState<WeeklyReflection[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);
  
  // Fetch data from the API
  useEffect(() => {
    async function fetchData() {
      if (user) {
        try {
          setIsLoadingData(true);
          const [logs, reflections] = await Promise.all([
            dailyLogService.getAllDailyLogs(user.id),
            weeklyReflectionService.getAllWeeklyReflections(user.id)
          ]);
          
          setDailyLogs(logs);
          setWeeklyReflections(reflections);
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setIsLoadingData(false);
        }
      }
    }
    
    fetchData();
  }, [user]);

  // Prepare data for charts
  const moodTrendData = prepareMoodTrendData(dailyLogs || []);
  const sleepQualityData = prepareSleepQualityData(dailyLogs || []);
  const focusEnergyData = prepareFocusEnergyData(dailyLogs || []);
  
  // Get the most recent weekly reflection
  const [latestWeeklyReflection, setLatestWeeklyReflection] = useState<{
    chartData: Array<{ category: string; value: number }>;
    weekStartDate: string;
  }>({ chartData: [], weekStartDate: "" });

  useEffect(() => {
    if (weeklyReflections && weeklyReflections.length > 0) {
      // Sort by date descending to get the most recent
      const sortedReflections = [...weeklyReflections].sort((a, b) => {
        return new Date(b.weekStartDate).getTime() - new Date(a.weekStartDate).getTime();
      });
      
      const latestReflection = sortedReflections[0];
      setLatestWeeklyReflection(prepareWeeklyInsightsData(latestReflection));
    }
  }, [weeklyReflections]);

  return (
    <div className="container mx-auto py-8 animate-fade-in">
      <h1 className="text-3xl font-bold mb-8">Insights Dashboard</h1>
      
      {isLoadingData ? (
        <div className="flex items-center justify-center h-[300px] text-muted-foreground">
          Loading data...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Mood Trend Chart */}
            <div className="bg-card p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Mood Trends</h2>
              {moodTrendData.length > 0 ? (
                <MoodTrendChart data={moodTrendData} />
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No mood data available yet
                </div>
              )}
            </div>
            
            {/* Sleep Quality Chart */}
            <div className="bg-card p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Sleep Quality</h2>
              {sleepQualityData.length > 0 ? (
                <SleepQualityChart data={sleepQualityData} />
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No sleep data available yet
                </div>
              )}
            </div>
            
            {/* Focus and Energy Chart */}
            <div className="bg-card p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Focus, Energy & Rumination</h2>
              {focusEnergyData.length > 0 ? (
                <FocusEnergyChart data={focusEnergyData} />
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No focus/energy data available yet
                </div>
              )}
            </div>
            
            {/* Weekly Insights Chart */}
            <div className="bg-card p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Weekly Insights</h2>
              {latestWeeklyReflection.chartData.length > 0 ? (
                <WeeklyInsightsChart 
                  data={latestWeeklyReflection.chartData} 
                  weekStartDate={latestWeeklyReflection.weekStartDate} 
                />
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No weekly reflection data available yet
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-8 bg-card p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Insights & Patterns</h2>
            <div className="space-y-4">
              {dailyLogs && dailyLogs.length > 0 ? (
                <>
                  <div>
                    <h3 className="text-lg font-medium">Sleep Impact</h3>
                    <p className="text-muted-foreground">
                      {calculateSleepInsight(dailyLogs)}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Mood Patterns</h3>
                    <p className="text-muted-foreground">
                      {calculateMoodInsight(dailyLogs)}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Rumination Triggers</h3>
                    <p className="text-muted-foreground">
                      {calculateRuminationInsight(dailyLogs)}
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">
                  Add more daily logs to see insights and patterns
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Helper functions to calculate insights
function calculateSleepInsight(dailyLogs: any[] | undefined | null) {
  if (!dailyLogs || dailyLogs.length < 3) {
    return "Not enough data to analyze sleep patterns yet.";
  }
  
  // Simple analysis of sleep quality vs mood
  const goodSleepDays = dailyLogs.filter(log => log.sleepQuality >= 7);
  const badSleepDays = dailyLogs.filter(log => log.sleepQuality < 5);
  
  const goodSleepMoodAvg = goodSleepDays.reduce((sum, log) => sum + (log.morningMood || 0), 0) / (goodSleepDays.length || 1);
  const badSleepMoodAvg = badSleepDays.reduce((sum, log) => sum + (log.morningMood || 0), 0) / (badSleepDays.length || 1);
  
  if (goodSleepMoodAvg - badSleepMoodAvg > 2) {
    return "There appears to be a strong correlation between your sleep quality and morning mood. Days with good sleep (7+ rating) show significantly better morning mood scores.";
  } else if (goodSleepMoodAvg - badSleepMoodAvg > 0) {
    return "There appears to be a moderate correlation between your sleep quality and morning mood. Better sleep generally leads to slightly improved mood.";
  } else {
    return "Your mood doesn't seem to be strongly affected by sleep quality based on current data.";
  }
}

function calculateMoodInsight(dailyLogs: any[] | undefined | null) {
  if (!dailyLogs || dailyLogs.length < 5) {
    return "Not enough data to analyze mood patterns yet.";
  }
  
  // Check for morning vs evening mood patterns
  const morningHigherCount = dailyLogs.filter(log => (log.morningMood || 0) > (log.overallMood || 0)).length;
  const eveningHigherCount = dailyLogs.filter(log => (log.overallMood || 0) > (log.morningMood || 0)).length;
  
  if (morningHigherCount > eveningHigherCount * 1.5) {
    return "You tend to start the day with higher mood that decreases throughout the day. Consider adding more positive activities in the afternoon.";
  } else if (eveningHigherCount > morningHigherCount * 1.5) {
    return "Your mood typically improves throughout the day. Morning routines that boost your mood might be helpful.";
  } else {
    return "Your mood appears relatively stable throughout the day without strong morning or evening patterns.";
  }
}

function calculateRuminationInsight(dailyLogs: any[] | undefined | null) {
  if (!dailyLogs || dailyLogs.length < 5) {
    return "Not enough data to analyze rumination patterns yet.";
  }
  
  // Simple analysis of rumination triggers
  const highRuminationDays = dailyLogs.filter(log => log.ruminationLevel >= 7);
  
  if (highRuminationDays.length >= dailyLogs.length * 0.4) {
    return "You've experienced high rumination (7+ rating) on " + 
      Math.round(highRuminationDays.length / dailyLogs.length * 100) + 
      "% of recorded days. Consider discussing rumination management strategies with your healthcare provider.";
  } else if (highRuminationDays.length > 0) {
    return "You occasionally experience high rumination days. Check your logs for potential triggers on those days.";
  } else {
    return "Your rumination levels appear to be generally well-managed based on current data.";
  }
}
