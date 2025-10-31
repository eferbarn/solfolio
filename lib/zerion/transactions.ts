/**
 * Transaction-specific API functions for Realized PnL calculation (FIFO-based)
 */

import { zerionRequest } from "./client"
import type { Transaction, ZerionListResponse } from "./types"

export interface GetTransactionsParams {
  walletAddress: string
  chainId?: string
  currency?: string
  pageSize?: number
}

/**
 * Fetch multiple pages of transactions up to a maximum count
 */
export async function getWalletTransactionsPaginated({
  walletAddress,
  chainId = "solana",
  currency = "usd",
  maxTransactions = 1000,
}: GetTransactionsParams & { maxTransactions?: number }): Promise<Transaction[]> {
  const allTransactions: Transaction[] = []
  const pageSize = 100 // Maximum allowed by Zerion API
  let cursor: string | null = null

  console.log("Fetching up to", maxTransactions, "transactions with pagination")

  while (allTransactions.length < maxTransactions) {
    const params: Record<string, string> = {
      currency,
      "page[size]": pageSize.toString(),
      "filter[trash]": "no_filter",
      "filter[chain_ids]": chainId,
    }

    // Add cursor for pagination if available
    if (cursor) {
      params["page[after]"] = cursor
    }

    const response = await zerionRequest<ZerionListResponse<Transaction>>({
      endpoint: `/wallets/${walletAddress}/transactions/`,
      params,
    })

    allTransactions.push(...response.data)
    console.log("Fetched", response.data.length, "transactions. Total:", allTransactions.length)

    // Check if there are more pages
    if (response.links?.next && allTransactions.length < maxTransactions) {
      // Extract cursor from next URL
      const nextUrl = new URL(response.links.next)
      cursor = nextUrl.searchParams.get("page[after]")

      if (!cursor) break // No more pages
    } else {
      break // No more pages or reached max
    }
  }

  // Trim to exact max if we fetched more
  const result = allTransactions.slice(0, maxTransactions)
  console.log("Returning", result.length, "transactions")

  return result
}

/**
 * Fetch transaction history from Zerion (single page)
 */
export async function getWalletTransactions({
  walletAddress,
  chainId = "solana", // filter to Solana
  currency = "usd",
  pageSize = 100,
}: GetTransactionsParams): Promise<Transaction[]> {
  const actualPageSize = Math.min(pageSize, 100)

  const params: Record<string, string> = {
    currency,
    "page[size]": actualPageSize.toString(),
    "filter[trash]": "no_filter",
    "filter[chain_ids]": chainId,
  }

  const response = await zerionRequest<ZerionListResponse<Transaction>>({
    endpoint: `/wallets/${walletAddress}/transactions/`,
    params,
  })

  return response.data
}

/**
 * Calculate realized PnL from transaction history using FIFO cost basis
 */
export function calculateRealizedPnL(transactions: Transaction[]): {
  total: number
  trades: number
} {
  console.log("[PnL] Starting Realized PnL calculation with", transactions.length, "transactions")

  const fifo: Record<string, { qty: number; price: number }[]> = {}
  let totalRealized = 0
  let tradeCount = 0

  // Sort by time to process FIFO correctly
  const sorted = [...transactions].sort(
    (a, b) =>
      new Date(a.attributes.mined_at || a.attributes.created_at).getTime() -
      new Date(b.attributes.mined_at || b.attributes.created_at).getTime(),
  )

  for (const [index, tx] of sorted.entries()) {
    if (tx.attributes.status !== "confirmed") continue

    const { operation_type, transfers, fee, value } = tx.attributes

    // Only handle trade or swap-like operations
    if (!["trade", "swap"].includes(operation_type)) continue

    const incoming: any[] = []
    const outgoing: any[] = []

    for (const transfer of transfers) {
      if (!transfer.value || !transfer.fungible_info?.symbol) continue
      if (transfer.direction === "in") incoming.push(transfer)
      if (transfer.direction === "out") outgoing.push(transfer)
    }

    if (incoming.length === 0 || outgoing.length === 0) continue // skip non-trade txs

    // Compute realized PnL per outgoing asset (sold token)
    for (const out of outgoing) {
      const symbol = out.fungible_info.symbol
      const qty = Number(out.quantity)
      const usdValue = out.value // USD value of the sale

      // Compute cost basis using FIFO
      let costBasis = 0
      let remaining = qty
      const buys = fifo[symbol] || []

      while (remaining > 0 && buys.length > 0) {
        const lot = buys[0]
        const used = Math.min(remaining, lot.qty)
        costBasis += used * lot.price
        lot.qty -= used
        remaining -= used
        if (lot.qty === 0) buys.shift()
      }

      const pnl = usdValue - costBasis
      totalRealized += pnl
      tradeCount++
      console.log(
        `[PnL] ${symbol}: sold ${qty} for $${usdValue.toFixed(2)}, cost basis $${costBasis.toFixed(
          2,
        )}, realized $${pnl.toFixed(2)}`,
      )
    }

    // Add incoming tokens to FIFO (purchases)
    for (const inc of incoming) {
      const symbol = inc.fungible_info.symbol
      const qty = Number(inc.quantity)
      const pricePerUnit = inc.value / qty

      if (!fifo[symbol]) fifo[symbol] = []
      fifo[symbol].push({ qty, price: pricePerUnit })
    }

    // Subtract fees (in USD)
    if (fee?.value) {
      totalRealized -= fee.value
    }
  }

  console.log(`[PnL] Final Realized PnL: $${totalRealized.toFixed(2)} from ${tradeCount} trades`)

  return {
    total: totalRealized,
    trades: tradeCount,
  }
}
