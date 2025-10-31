"use client"

/**
 * Asset Allocation Chart Component
 * Displays portfolio distribution by asset with top 5 + others
 */

import { Card } from "@/components/ui/card"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import type { Position } from "@/lib/zerion/types"

interface AssetAllocationProps {
  positions: Position[]
  totalValue: number
  isLoading?: boolean
}

const COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#64748b", // slate (for Others)
]

export function AssetAllocation({ positions, totalValue, isLoading }: AssetAllocationProps) {
  const sortedPositions = [...positions]
    .filter((pos) => pos.attributes.value && pos.attributes.value > 0)
    .sort((a, b) => (b.attributes.value || 0) - (a.attributes.value || 0))

  const top5Positions = sortedPositions.slice(0, 5)
  const othersPositions = sortedPositions.slice(5)

  const othersTotal = othersPositions.reduce((sum, pos) => sum + (pos.attributes.value || 0), 0)
  const othersPnL = othersPositions.reduce((sum, pos) => sum + (pos.attributes.changes?.absolute_1d || 0), 0)

  const allocationData = [
    ...top5Positions.map((pos) => ({
      name: pos.attributes.fungible_info.symbol,
      value: pos.attributes.value || 0,
      pnl24h: pos.attributes.changes?.absolute_1d || 0,
      pnlPercent: pos.attributes.changes?.percent_1d || 0,
    })),
    ...(othersTotal > 0
      ? [
          {
            name: "Others",
            value: othersTotal,
            pnl24h: othersPnL,
            pnlPercent: othersTotal > 0 ? (othersPnL / othersTotal) * 100 : 0,
          },
        ]
      : []),
  ]

  if (isLoading) {
    return (
      <Card className="p-6">
        <h2 className="mb-4 text-xl font-bold">Asset Allocation</h2>
        <div className="flex h-[500px] items-center justify-center">
          <p className="text-muted-foreground">Loading allocation data...</p>
        </div>
      </Card>
    )
  }

  if (allocationData.length === 0) {
    return (
      <Card className="p-6">
        <h2 className="mb-4 text-xl font-bold">Asset Allocation</h2>
        <div className="flex h-[500px] items-center justify-center">
          <p className="text-muted-foreground">No allocation data available</p>
        </div>
      </Card>
    )
  }

  const dataWithPercentages = allocationData.map((item, index) => ({
    ...item,
    percentage: totalValue > 0 ? (item.value / totalValue) * 100 : 0,
    color: COLORS[index % COLORS.length],
  }))

  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold">Asset Allocation</h2>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total Portfolio Value</p>
          <p className="text-2xl font-bold text-primary">
            ${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        {/* Asset Breakdown - Left Side */}
        <div className="flex flex-col gap-4 lg:w-1/2">
          <div className="space-y-3">
            {dataWithPercentages.map((item, index) => {
              const isPositive = item.pnlPercent >= 0
              const pnlColor = isPositive ? "text-green-600" : "text-red-600"

              return (
                <div key={item.name} className="flex items-center gap-3 rounded-lg p-3">
                  <div
                    className="h-4 w-4 shrink-0 rounded-full ring-2 ring-background"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex min-w-0 flex-1 flex-col gap-1 md:flex-row md:items-center md:justify-between md:gap-3">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold">{item.name}</span>
                      <span className={`text-xs font-medium ${pnlColor}`}>
                        {isPositive ? "+" : ""}
                        {item.pnlPercent.toFixed(2)}%
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground md:text-right">
                      $
                      {item.value.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Pie Chart - Right Side */}
        <div className="flex items-center justify-center lg:w-1/2">
          <div className="h-[400px] w-full max-w-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataWithPercentages}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={140}
                  innerRadius={70}
                  dataKey="value"
                >
                  {dataWithPercentages.map((entry, index) => (
                    <Cell
                      key={`cell-${entry.name}-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      stroke="#ffffff"
                      strokeWidth={3}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      const isPositive = data.pnlPercent >= 0
                      return (
                        <div className="rounded-lg border bg-background p-3 shadow-lg">
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-semibold">{data.name}</span>
                            <span className="text-sm text-muted-foreground">
                              $
                              {data.value.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                            <span className="text-xs font-medium text-primary">
                              {data.percentage.toFixed(2)}% of portfolio
                            </span>
                            <span className={`text-xs font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}>
                              24h PnL: {isPositive ? "+" : ""}
                              {data.pnlPercent.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Card>
  )
}
