"use client"

/**
 * PnL Summary Component
 * Displays profit and loss breakdown
 */

import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react"

interface PnLSummaryProps {
  totalPnL: number
  realizedPnL: number
  unrealizedPnL: number
  isLoading?: boolean
}

export function PnLSummary({ totalPnL, realizedPnL, unrealizedPnL, isLoading }: PnLSummaryProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="mb-4 h-6 w-40" />
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </Card>
    )
  }

  const isPositive = totalPnL >= 0

  return (
    <Card className="p-6">
      <h2 className="mb-4 text-xl font-bold">Profit & Loss Summary</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {/* Total PnL */}
        <div className="rounded-lg border border-border bg-muted/50 p-4">
          <div className="mb-2 flex items-center gap-2">
            {isPositive ? (
              <TrendingUp className="h-5 w-5 text-green-600" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-600" />
            )}
            <p className="text-sm font-medium text-muted-foreground">Total PnL</p>
          </div>
          <p className={`text-2xl font-bold ${isPositive ? "text-green-600" : "text-red-600"}`}>
            {isPositive ? "+" : "-"}$
            {Math.abs(totalPnL).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        {/* Realized PnL */}
        <div className="rounded-lg border border-border bg-muted/50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-blue-600" />
            <p className="text-sm font-medium text-muted-foreground">Realized PnL</p>
          </div>
          <p className={`text-2xl font-bold ${realizedPnL >= 0 ? "text-green-600" : "text-red-600"}`}>
            {realizedPnL >= 0 ? "+" : "-"}$
            {Math.abs(realizedPnL).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        {/* Unrealized PnL */}
        <div className="rounded-lg border border-border bg-muted/50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <p className="text-sm font-medium text-muted-foreground">Unrealized PnL</p>
          </div>
          <p className={`text-2xl font-bold ${unrealizedPnL >= 0 ? "text-green-600" : "text-red-600"}`}>
            {unrealizedPnL >= 0 ? "+" : "-"}$
            {Math.abs(unrealizedPnL).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </Card>
  )
}
