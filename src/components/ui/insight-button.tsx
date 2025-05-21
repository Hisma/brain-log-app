import * as React from "react"
import { Button } from "@/components/ui/button"
import { Lightbulb } from "lucide-react"
import { useRouter } from "next/navigation"

interface InsightButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  dailyLogId: number
  isComplete: boolean
}

function InsightButton({ 
  dailyLogId, 
  isComplete,
  className,
  ...props
}: InsightButtonProps) {
  const router = useRouter()

  const handleGenerateInsight = () => {
    router.push(`/insights?dailyLogId=${dailyLogId}`)
  }

  if (!isComplete) {
    return null
  }

  return (
    <Button
      variant="outline"
      onClick={handleGenerateInsight}
      className={className}
      {...props}
    >
      <Lightbulb className="h-4 w-4" />
      View AI Insights
    </Button>
  )
}

export { InsightButton }
