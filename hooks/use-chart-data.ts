"use client"

/**
 * Custom hook for fetching chart data
 */

import { useState, useEffect, useCallback } from "react"
import { transformChartData } from "@/lib/zerion/charts"
import type { ChartPeriod } from "@/lib/zerion/charts"

export function useChartData(fungibleId: string | null, period: ChartPeriod = "1d") {
  const [data, setData] = useState<
    Array<{
      timestamp: number
      value: number
      date: string
      time: string
    }>
  >([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchChartData = useCallback(async () => {
    if (!fungibleId) {
      setData([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/chart?fungibleId=${encodeURIComponent(fungibleId)}&period=${period}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch chart data")
      }

      const result = await response.json()
      const transformedData = transformChartData(result.data)

      setData(transformedData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setData([])
    } finally {
      setIsLoading(false)
    }
  }, [fungibleId, period])

  useEffect(() => {
    fetchChartData()
  }, [fetchChartData])

  return {
    data,
    isLoading,
    error,
    refetch: fetchChartData,
  }
}
