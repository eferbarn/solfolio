/**
 * Portfolio-specific API functions
 */

import { zerionRequest } from "./client"
import type { Position, WalletPortfolio, ZerionListResponse, ZerionSingleResponse } from "./types"

export interface GetPositionsParams {
  walletAddress: string
  chainId?: string
  currency?: string
  sortBy?: "value" | "quantity"
  sortDirection?: "asc" | "desc"
}

/**
 * Get all positions for a wallet address
 */
export async function getWalletPositions({
  walletAddress,
  chainId,
  currency = "usd",
}: GetPositionsParams): Promise<Position[]> {
  const params: Record<string, string> = {
    "filter[positions]": "only_simple",
    currency: "usd",
    "filter[trash]": "only_non_trash",
    sort: "value",
  }

  if (chainId) {
    params["filter[chain_ids]"] = chainId
  }

  const response = await zerionRequest<ZerionListResponse<Position>>({
    endpoint: `/wallets/${walletAddress}/positions/`,
    params,
  })

  const validPositions = response.data.filter((position) => {
    const { fungible_info, value } = position.attributes

    // Exclude positions with missing or empty symbol/name
    if (!fungible_info?.symbol || fungible_info.symbol.trim() === "") {
      return false
    }

    // Exclude positions with null or zero value
    if (value === null || value === 0) {
      return false
    }

    // Exclude positions with incomplete data (missing required fields)
    if (!position.attributes.quantity || !position.attributes.price) {
      return false
    }

    return true
  })

  return validPositions
}

/**
 * Get wallet portfolio summary
 */
export async function getWalletPortfolio(walletAddress: string, currency = "usd"): Promise<WalletPortfolio> {
  const response = await zerionRequest<ZerionSingleResponse<WalletPortfolio>>({
    endpoint: `/wallets/${walletAddress}/portfolio`,
    params: {
      "filter[positions]": "only_simple",
      currency: "usd",
    },
  })

  return response.data
}

/**
 * Calculate total portfolio value from positions
 */
export function calculateTotalValue(positions: Position[]): number {
  return positions.reduce((total, position) => {
    return total + (position.attributes.value || 0)
  }, 0)
}

/**
 * Calculate 24h PnL from positions
 */
export function calculate24hPnL(positions: Position[]): {
  absolute: number
  percent: number
} {
  let totalAbsolute = 0
  let totalValue = 0

  positions.forEach((position) => {
    const value = position.attributes.value || 0
    const change = position.attributes.changes?.absolute_1d || 0

    totalAbsolute += change
    totalValue += value
  })

  const percent = totalValue > 0 ? (totalAbsolute / (totalValue - totalAbsolute)) * 100 : 0

  return {
    absolute: totalAbsolute,
    percent,
  }
}

/**
 * Group positions by chain
 */
export function groupPositionsByChain(positions: Position[]): Record<string, Position[]> {
  return positions.reduce(
    (acc, position) => {
      const chainId = position.relationships.chain.data.id
      if (!acc[chainId]) {
        acc[chainId] = []
      }
      acc[chainId].push(position)
      return acc
    },
    {} as Record<string, Position[]>,
  )
}
