"use client"

/**
 * Asset Preferences Chart Component
 * Displays wallet's preferred asset categories using a Radar Chart
 */

import { Card } from "@/components/ui/card"
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts"
import type { AssetPreference } from "@/lib/utils/transaction-analysis"

interface AssetPreferencesProps {
  preferences: AssetPreference[]
  isLoading?: boolean
}

const CATEGORY_COLORS = {
  Stablecoin: "#10b981", // green
  Meme: "#ef4444", // red
  Token: "#3b82f6", // blue
}

/**
 * Applies cube root transformation to make smaller percentages more visible
 * while maintaining relative differences
 */
function scaleValue(percentage: number): number {
  // Use cube root transformation: smaller values become more visible
  // 100% → 100, 25% → ~63, 10% → ~46, 1% → ~21
  return Math.pow(percentage, 1 / 3) * Math.pow(100, 2 / 3)
}

export function AssetPreferences({ preferences, isLoading }: AssetPreferencesProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold">Asset Category Preferences</h3>
        <div className="flex h-[400px] items-center justify-center">
          <p className="text-muted-foreground">Loading preferences...</p>
        </div>
      </Card>
    )
  }

  const chartData = preferences.map((pref) => ({
    category: pref.category,
    value: scaleValue(pref.percentage), // Scaled value for visualization
    actualValue: pref.percentage, // Original percentage for tooltip
    count: pref.count,
    color: CATEGORY_COLORS[pref.category],
  }))

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="mb-2 text-lg font-semibold">Asset Category Preferences</h3>
        <p className="text-sm text-muted-foreground">
          Data based on the last 1,000 transactions, reflecting recent wallet interests and interaction patterns across different asset categories.
        </p>
      </div>

      <div className="flex items-center justify-center">
        <div className="h-[450px] w-full max-w-[500px] pt-12">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
              <PolarGrid stroke="#e5e7eb" strokeDasharray="3 3" />
              <PolarAngleAxis
                dataKey="category"
                tick={{ fill: "hsl(var(--foreground))", fontSize: 14, fontWeight: 600 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                ticks={[0, 25, 50, 75]}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
              <Radar
                name="Percentage"
                dataKey="value"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.6}
                strokeWidth={2}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-lg">
                        <p className="font-semibold" style={{ color: data.color }}>
                          {data.category}
                        </p>
                        <p className="text-sm text-muted-foreground">{data.count} transactions</p>
                        <p className="text-lg font-bold" style={{ color: data.color }}>
                          {data.actualValue.toFixed(1)}%
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  )
}
