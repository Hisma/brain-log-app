"use client";

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { WeeklyReflection } from "@/lib/services/weeklyReflectionService";

interface WeeklyInsightsChartProps {
  data: Array<{
    category: string;
    value: number;
  }>;
  weekStartDate: string;
}

export function WeeklyInsightsChart({ data, weekStartDate }: WeeklyInsightsChartProps) {
  const chartConfig = {
    value: {
      label: "Rating",
      color: "hsl(var(--chart-4))",
    },
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">Week of {weekStartDate}</h3>
      <ChartContainer config={chartConfig} className="h-[400px] w-full">
        <RadarChart accessibilityLayer data={data} outerRadius={150}>
          <PolarGrid />
          <PolarAngleAxis dataKey="category" />
          <PolarRadiusAxis domain={[0, 10]} />
          <Radar
            dataKey="value"
            fill="var(--color-value)"
            fillOpacity={0.6}
            stroke="var(--color-value)"
          />
          <ChartTooltip content={<ChartTooltipContent />} />
        </RadarChart>
      </ChartContainer>
    </div>
  );
}

// Helper function to prepare data for the chart
export function prepareWeeklyInsightsData(weeklyReflection: WeeklyReflection | undefined | null): {
  chartData: WeeklyInsightsChartProps["data"];
  weekStartDate: string;
} {
  if (!weeklyReflection) {
    return {
      chartData: [],
      weekStartDate: "",
    };
  }

  const weekStartDate = new Date(weeklyReflection.weekStartDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // Create radar chart data from weekly reflection
  const chartData = [
    {
      category: "Mental State",
      value: weeklyReflection.weekRating || 5,
    },
    {
      category: "Stable Days",
      value: weeklyReflection.stableDaysCount || 0,
    },
    {
      category: "Medication Effective",
      value: weeklyReflection.medicationEffectiveDays || 0,
    },
    {
      category: "Rumination (Inverse)",
      value: 10 - (weeklyReflection.averageRuminationScore || 5),
    },
    {
      category: "Job Satisfaction",
      value: weeklyReflection.questionedLeavingJob ? 3 : 8,
    },
  ];

  return {
    chartData,
    weekStartDate,
  };
}
