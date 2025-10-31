"use client"

/**
 * Portfolio Header Component
 * Displays total value and Total PnL with transaction statistics
 */

import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft, RefreshCw, Fuel } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface PortfolioHeaderProps {
  totalValue: number
  pnl24h: {
    absolute: number
    percent: number
  }
  totalPnL: number
  transactionStats: {
    total: number
    sent: number
    received: number
    traded: number
    gasSpent: number
  }
  isLoading?: boolean
}

export function PortfolioHeader({ totalValue, pnl24h, totalPnL, transactionStats, isLoading }: PortfolioHeaderProps) {
  const isPositive = totalPnL >= 0

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-6 w-40" />
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 items-center justify-center">
          <div className="space-y-2 relative">
            <p className="text-sm text-muted-foreground">Total Portfolio Value</p>
            <h1 className="text-4xl font-bold tracking-tight">
              ${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h1>
            <div className="flex items-center gap-2">
              {isPositive ? (
                <TrendingUp className="h-5 w-5 text-green-600" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-600" />
              )}
              <span className={`text-lg font-semibold ${isPositive ? "text-green-600" : "text-red-600"}`}>
                {isPositive ? "+" : "-"}$
                {Math.abs(totalPnL).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-sm text-muted-foreground">Total PnL</span>
            </div>
          </div>
        </div>

        {/* Right side - Transaction Stats with more padding */}
        <div className="lg:border-l lg:pl-8">
          <div className="space-y-3 pr-6 mr-0 ml-0">
            <p className="text-sm font-medium text-muted-foreground">Last 100 Transactions</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                  <ArrowDownLeft className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-sm">
                  <span className="font-semibold">{transactionStats.received}</span>
                  <span className="ml-1 text-muted-foreground">Received</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                  <ArrowUpRight className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
                <span className="text-sm">
                  <span className="font-semibold">{transactionStats.sent}</span>
                  <span className="ml-1 text-muted-foreground">Sent</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                  <RefreshCw className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm">
                  <span className="font-semibold">{transactionStats.traded}</span>
                  <span className="ml-1 text-muted-foreground">Traded</span>
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 border-t pt-2">
              <Fuel className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <span className="font-semibold">
                  {transactionStats.gasSpent.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                </span>
                <span className="ml-1 text-muted-foreground">SOL Gas Spent</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
