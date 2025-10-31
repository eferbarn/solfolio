"use client"

/**
 * Insights Statistics Component
 * Displays key wallet insights metrics
 */

import { Card } from "@/components/ui/card"
import { Users, TrendingUp, Coins } from "lucide-react"
import type { InsightsData } from "@/lib/utils/transaction-analysis"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface InsightsStatsProps {
  data: InsightsData
  isLoading?: boolean
}

export function InsightsStats({ data, isLoading }: InsightsStatsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse space-y-3">
              <div className="h-4 w-1/2 rounded bg-muted" />
              <div className="h-8 w-3/4 rounded bg-muted" />
            </div>
          </Card>
        ))}
      </div>
    )
  }

  const preferredCategory = data.assetPreferences.reduce((max, pref) => (pref.percentage > max.percentage ? pref : max))

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
            <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="cursor-help text-sm text-muted-foreground">Unique Interactions</p>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    The number of unique wallet addresses this wallet has interacted with through transactions
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <p className="text-2xl font-bold">{data.uniquePartners}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900">
            <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Preferred Category</p>
            <p className="text-2xl font-bold">{preferredCategory.category}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-amber-100 p-3 dark:bg-amber-900">
            <Coins className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Most Active Asset</p>
            <p className="text-2xl font-bold">{data.mostActiveAsset?.symbol || "N/A"}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
