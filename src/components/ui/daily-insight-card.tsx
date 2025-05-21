import React from "react"
import { format } from "date-fns"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lightbulb, RefreshCw } from "lucide-react"
import ReactMarkdown from "react-markdown"

interface DailyInsightCardProps {
  dailyLogId: number
  date: Date
  insightText: string
  onGenerateInsight: () => void
  isLoading: boolean
}

function DailyInsightCard({
  dailyLogId,
  date,
  insightText,
  onGenerateInsight,
  isLoading
}: DailyInsightCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Lightbulb className="h-5 w-5 mr-2 text-amber-500" />
          AI Insights for {format(date, "MMMM d, yyyy")}
        </CardTitle>
        <CardDescription>
          Personalized analysis based on your daily log data
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
              No insights generated yet for this daily log. Generate insights to receive personalized analysis of your day.
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

export { DailyInsightCard }
