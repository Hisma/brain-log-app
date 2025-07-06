"use client";

import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { DailyLog } from "@/lib/services/dailyLogService";

interface SleepQualityChartProps {
  data: Array<{
    date: string;
    sleepQuality?: number;
    sleepHours?: number;
  }>;
}

export function SleepQualityChart({ data }: SleepQualityChartProps) {
  const chartConfig = {
    sleepQuality: {
      label: "Sleep Quality",
      color: "hsl(var(--chart-2))",
    },
    sleepHours: {
      label: "Sleep Hours",
      color: "hsl(var(--chart-3))",
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
          yAxisId="left"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          domain={[0, 10]}
          ticks={[0, 2, 4, 6, 8, 10]}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          domain={[0, 12]}
          ticks={[0, 2, 4, 6, 8, 10, 12]}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="sleepQuality"
          stroke="var(--color-sleepQuality)"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="sleepHours"
          stroke="var(--color-sleepHours)"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ChartContainer>
  );
}

// Helper function to prepare data for the chart
export function prepareSleepQualityData(dailyLogs: DailyLog[] | undefined | null): SleepQualityChartProps["data"] {
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
      sleepQuality: log.sleepQuality,
      sleepHours: log.sleepHours,
    };
  });
}
