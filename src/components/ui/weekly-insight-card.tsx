import React from "react"
import { format } from "date-fns"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lightbulb, RefreshCw } from "lucide-react"
import ReactMarkdown from "react-markdown"

interface WeeklyInsightCardProps {
  weeklyReflectionId: number
  startDate: Date
  endDate: Date
  insightText: string
  onGenerateInsight: () => void
  isLoading: boolean
}

function WeeklyInsightCard({
  weeklyReflectionId,
  startDate,
  endDate,
  insightText,
  onGenerateInsight,
  isLoading
}: WeeklyInsightCardProps) {
  // Format date range (e.g., "May 12 - May 18, 2025")
  const dateRange = `${format(startDate, "MMMM d")} - ${format(endDate, "MMMM d, yyyy")}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Lightbulb className="h-5 w-5 mr-2 text-amber-500" />
          Weekly Insights for {dateRange}
        </CardTitle>
        <CardDescription>
          Personalized analysis based on your weekly reflection data
        </CardDescription>
      </CardHeader>
      <CardContent>
        {insightText ? (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>{insightText}</ReactMarkdown>
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-muted-foreground mb-6">
              No insights generated yet for this weekly reflection. Generate insights to receive personalized analysis of your week.
            </p>
            <Button 
              onClick={onGenerateInsight}
              disabled={isLoading}
              className="flex items-center"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating Insights...
                </>
              ) : (
                <>
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Generate Insights
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
      {insightText && (
        <CardFooter className="flex justify-end">
          <Button 
            variant="outline" 
            onClick={onGenerateInsight}
            disabled={isLoading}
            className="flex items-center"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Regenerating...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerate Insights
              </>
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}

export { WeeklyInsightCard }
