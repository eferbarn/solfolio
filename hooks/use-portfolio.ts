"use client"

/**
 * Custom hook for fetching portfolio data
 */

import { useState, useEffect, useCallback, useRef } from "react"
import type { Position, WalletPortfolio } from "@/lib/zerion/types"
import { calculate24hPnL, calculateTotalValue } from "@/lib/zerion/portfolio"

export interface PortfolioData {
  positions: Position[]
  portfolio: WalletPortfolio | null
  totalValue: number
  pnl24h: {
    absolute: number
    percent: number
  }
}

interface UsePortfolioOptions {
  refreshInterval?: number // in milliseconds
  enabled?: boolean
}

export function usePortfolio(walletAddress: string | null, options: UsePortfolioOptions = {}) {
  const { refreshInterval = 30000, enabled = true } = options // Default: 30 seconds

  const [data, setData] = useState<PortfolioData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchPortfolio = useCallback(async () => {
    if (!walletAddress || !enabled) {
      setData(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/portfolio?address=${encodeURIComponent(walletAddress)}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch portfolio")
      }

      const result = await response.json()

      const totalValue = calculateTotalValue(result.positions)
      const pnl24h = calculate24hPnL(result.positions)

      setData({
        positions: result.positions,
        portfolio: result.portfolio,
        totalValue,
        pnl24h,
      })
      setLastUpdated(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setData(null)
    } finally {
      setIsLoading(false)
    }
  }, [walletAddress, enabled])

  // Initial fetch
  useEffect(() => {
    fetchPortfolio()
  }, [fetchPortfolio])

  useEffect(() => {
    if (!enabled || !walletAddress || refreshInterval <= 0) {
      return
    }

    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    // Set up new interval
    intervalRef.current = setInterval(() => {
      fetchPortfolio()
    }, refreshInterval)

    // Cleanup on unmount or when dependencies change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [fetchPortfolio, refreshInterval, enabled, walletAddress])

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    refetch: fetchPortfolio,
  }
}
