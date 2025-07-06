"use client";

import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { DailyLog } from "@/lib/services/dailyLogService";

interface MoodTrendChartProps {
  data: Array<{
    date: string;
    morningMood?: number;
    overallMood?: number;
  }>;
}

export function MoodTrendChart({ data }: MoodTrendChartProps) {
  const chartConfig = {
    morningMood: {
      label: "Morning Mood",
      color: "hsl(var(--chart-1))",
    },
    overallMood: {
      label: "Evening Mood",
      color: "hsl(var(--chart-2))",
    },
  };

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <LineChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <YAxis
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          domain={[0, 10]}
          ticks={[0, 2, 4, 6, 8, 10]}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Line
          type="monotone"
          dataKey="morningMood"
          stroke="var(--color-morningMood)"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="overallMood"
          stroke="var(--color-overallMood)"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ChartContainer>
  );
}

// Helper function to prepare data for the chart
export function prepareMoodTrendData(dailyLogs: DailyLog[] | undefined | null): MoodTrendChartProps["data"] {
  if (!dailyLogs || dailyLogs.length === 0) {
    return [];
  }

  // Sort logs by date
  const sortedLogs = [...dailyLogs].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  // Format data for the chart
  return sortedLogs.map((log) => {
    const date = new Date(log.date);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      morningMood: log.morningMood,
      overallMood: log.overallMood,
    };
  });
}
