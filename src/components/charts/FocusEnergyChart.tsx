"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { DailyLog } from "@/lib/services/dailyLogService";

interface FocusEnergyChartProps {
  data: Array<{
    date: string;
    focusLevel?: number;
    energyLevel?: number;
    ruminationLevel?: number;
  }>;
}

export function FocusEnergyChart({ data }: FocusEnergyChartProps) {
  const chartConfig = {
    focusLevel: {
      label: "Focus Level",
      color: "hsl(var(--chart-1))",
    },
    energyLevel: {
      label: "Energy Level",
      color: "hsl(var(--chart-4))",
    },
    ruminationLevel: {
      label: "Rumination Level",
      color: "hsl(var(--chart-5))",
    },
  };

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <BarChart accessibilityLayer data={data}>
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
        <Bar
          dataKey="focusLevel"
          fill="var(--color-focusLevel)"
          radius={[4, 4, 0, 0]}
          barSize={8}
        />
        <Bar
          dataKey="energyLevel"
          fill="var(--color-energyLevel)"
          radius={[4, 4, 0, 0]}
          barSize={8}
        />
        <Bar
          dataKey="ruminationLevel"
          fill="var(--color-ruminationLevel)"
          radius={[4, 4, 0, 0]}
          barSize={8}
        />
      </BarChart>
    </ChartContainer>
  );
}

// Helper function to prepare data for the chart
export function prepareFocusEnergyData(dailyLogs: DailyLog[] | undefined | null): FocusEnergyChartProps["data"] {
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
      focusLevel: log.focusLevel,
      energyLevel: log.energyLevel,
      ruminationLevel: log.ruminationLevel,
    };
  });
}
