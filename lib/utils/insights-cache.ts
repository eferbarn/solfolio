/**
 * Insights data caching utilities
 * Implements 6-hour cache for expensive computations
 */

export interface InsightsCache {
  data: any
  timestamp: number
  expiresAt: number
}

const CACHE_DURATION = 6 * 60 * 60 * 1000 // 6 hours in milliseconds

/**
 * Get cached insights data from localStorage
 */
export function getCachedInsights(walletAddress: string): InsightsCache | null {
  if (typeof window === "undefined") return null

  try {
    const cacheKey = `insights_${walletAddress}`
    const cached = localStorage.getItem(cacheKey)

    if (!cached) return null

    const parsedCache: InsightsCache = JSON.parse(cached)

    // Check if cache is still valid
    if (Date.now() > parsedCache.expiresAt) {
      localStorage.removeItem(cacheKey)
      return null
    }

    return parsedCache
  } catch (error) {
    console.error("Error reading insights cache:", error)
    return null
  }
}

/**
 * Save insights data to localStorage cache
 */
export function setCachedInsights(walletAddress: string, data: any): void {
  if (typeof window === "undefined") return

  try {
    const cacheKey = `insights_${walletAddress}`
    const timestamp = Date.now()
    const cache: InsightsCache = {
      data,
      timestamp,
      expiresAt: timestamp + CACHE_DURATION,
    }

    localStorage.setItem(cacheKey, JSON.stringify(cache))
  } catch (error) {
    console.error("Error saving insights cache:", error)
  }
}

/**
 * Clear insights cache for a wallet
 */
export function clearInsightsCache(walletAddress: string): void {
  if (typeof window === "undefined") return

  try {
    const cacheKey = `insights_${walletAddress}`
    localStorage.removeItem(cacheKey)
  } catch (error) {
    console.error("Error clearing insights cache:", error)
  }
}

/**
 * Get time remaining until cache expires
 */
export function getCacheTimeRemaining(cache: InsightsCache): number {
  return Math.max(0, cache.expiresAt - Date.now())
}

/**
 * Format cache expiry time for display
 */
export function formatCacheExpiry(cache: InsightsCache): string {
  const remaining = getCacheTimeRemaining(cache)
  const hours = Math.floor(remaining / (60 * 60 * 1000))
  const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000))

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}
