"use client"

/**
 * Portfolio Stats Component
 * Displays key portfolio statistics
 */

import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Wallet, TrendingUp, TrendingDown, PieChart } from "lucide-react"

interface PortfolioStatsProps {
  totalPositions: number
  largestPosition?: {
    symbol: string
    value: number
  }
  topPerformer?: {
    symbol: string
    change: number
  }
  isTopPerformer?: boolean
  isLoading?: boolean
}

export function PortfolioStats({
  totalPositions,
  largestPosition,
  topPerformer,
  isTopPerformer = true,
  isLoading,
}: PortfolioStatsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    )
  }

  const isPositive = topPerformer ? topPerformer.change >= 0 : true

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <Wallet className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Positions</p>
            <p className="text-2xl font-bold">{totalPositions}</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-500/10 p-2">
            <PieChart className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Largest Holding</p>
            {largestPosition ? (
              <p className="text-2xl font-bold">
                {largestPosition.symbol}{" "}
                <span className="text-sm text-muted-foreground">
                  ${largestPosition.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">N/A</p>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className={`rounded-lg p-2 ${isPositive ? "bg-green-500/10" : "bg-red-500/10"}`}>
            {isPositive ? (
              <TrendingUp className="h-5 w-5 text-green-600" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-600" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-1">{isTopPerformer ? "Top Performer" : "Biggest Loss"}</p>
            {topPerformer ? (
              <div>
                <p className="text-2xl font-bold">{topPerformer.symbol}</p>
                <span className={`text-lg font-semibold ${isPositive ? "text-green-600" : "text-red-600"}`}>
                  {topPerformer.change >= 0 ? "+" : ""}
                  {topPerformer.change.toFixed(2)}%
                </span>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">N/A</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
