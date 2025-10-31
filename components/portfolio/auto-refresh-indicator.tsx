"use client"

/**
 * Auto Refresh Indicator Component
 * Shows when data was last updated and countdown to next refresh
 */

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"

interface AutoRefreshIndicatorProps {
  lastUpdated: Date | null
  refreshInterval: number // in milliseconds
  isLoading?: boolean
}

export function AutoRefreshIndicator({ lastUpdated, refreshInterval, isLoading }: AutoRefreshIndicatorProps) {
  const [timeAgo, setTimeAgo] = useState<string>("")
  const [countdown, setCountdown] = useState<number>(refreshInterval / 1000)

  useEffect(() => {
    if (!lastUpdated) return

    const updateTimeAgo = () => {
      const seconds = Math.floor((Date.now() - lastUpdated.getTime()) / 1000)

      if (seconds < 60) {
        setTimeAgo(`${seconds}s ago`)
      } else if (seconds < 3600) {
        setTimeAgo(`${Math.floor(seconds / 60)}m ago`)
      } else {
        setTimeAgo(`${Math.floor(seconds / 3600)}h ago`)
      }

      // Calculate countdown to next refresh
      const nextRefreshIn = Math.max(0, refreshInterval / 1000 - seconds)
      setCountdown(Math.ceil(nextRefreshIn))
    }

    updateTimeAgo()
    const interval = setInterval(updateTimeAgo, 1000)

    return () => clearInterval(interval)
  }, [lastUpdated, refreshInterval])

  if (!lastUpdated) return null

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Clock className="h-4 w-4" />
      <span>Updated {timeAgo}</span>
      {!isLoading && countdown > 0 && (
        <Badge variant="outline" className="ml-2">
          Next update in {countdown}s
        </Badge>
      )}
      {isLoading && (
        <Badge variant="outline" className="ml-2">
          Updating...
        </Badge>
      )}
    </div>
  )
}
