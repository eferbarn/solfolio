/**
 * Chart data fetching functions
 */

import { zerionRequest } from "./client"
import type { FungibleChart, ChartDataPoint } from "./types"

export type ChartPeriod = "1h" | "1d" | "1w" | "1m" | "3m" | "1y" | "max"

export interface GetChartParams {
  fungibleId: string
  period?: ChartPeriod
  currency?: string
}

/**
 * Get price chart for a fungible asset
 */
export async function getFungibleChart({
  fungibleId,
  period = "1d",
  currency = "usd",
}: GetChartParams): Promise<ChartDataPoint[]> {
  const response = await zerionRequest<FungibleChart>({
    endpoint: `/fungibles/${fungibleId}/charts`,
    params: {
      period,
      currency,
    },
  })

  return response.data.attributes.points
}

/**
 * Transform chart data for recharts
 */
export function transformChartData(points: ChartDataPoint[]) {
  return points.map((point) => ({
    timestamp: point.timestamp * 1000, // Convert to milliseconds
    value: point.value,
    date: new Date(point.timestamp * 1000).toLocaleDateString(),
    time: new Date(point.timestamp * 1000).toLocaleTimeString(),
  }))
}
