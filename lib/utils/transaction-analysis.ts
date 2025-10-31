/**
 * Transaction analysis utilities for insights
 */

import type { Transaction } from "@/lib/zerion/types"
import { getTokenCategory } from "./token-categories"

export interface TransactionPartner {
  address: string
  count: number
  totalValue: number
  lastInteraction: string
}

export interface TreeMapWallet {
  name: string
  address: string
  count: number
  value: number
  size: number
  color: string
  lastInteraction: string
}

export interface AssetPreference {
  category: "Stablecoin" | "Meme" | "Token"
  count: number
  percentage: number
}

export interface InsightsData {
  topPartners: TransactionPartner[]
  assetPreferences: AssetPreference[]
  totalTransactions: number
  uniquePartners: number
  mostActiveAsset: {
    symbol: string
    count: number
  } | null
  treeMapData: TreeMapWallet[]
}

/**
 * Analyze transactions to find most frequent partners
 * @param transactions - Array of transactions to analyze
 * @param limit - Maximum number of partners to return (default: 10, use Infinity for all)
 */
export function analyzeTransactionPartners(transactions: Transaction[], limit = 10): TransactionPartner[] {
  const partnerMap = new Map<string, TransactionPartner>()

  transactions.forEach((tx) => {
    const { sent_from, sent_to, transfers, mined_at } = tx.attributes

    // Determine the partner address (not the wallet owner)
    const partners = new Set<string>()
    transfers.forEach((transfer) => {
      if (transfer.sender) partners.add(transfer.sender)
      if (transfer.recipient) partners.add(transfer.recipient)
    })

    // Calculate transaction value
    const txValue = transfers.reduce((sum, transfer) => sum + (transfer.value || 0), 0)

    partners.forEach((partner) => {
      if (!partner) return

      const existing = partnerMap.get(partner)
      if (existing) {
        existing.count++
        existing.totalValue += txValue
        existing.lastInteraction = mined_at
      } else {
        partnerMap.set(partner, {
          address: partner,
          count: 1,
          totalValue: txValue,
          lastInteraction: mined_at,
        })
      }
    })
  })

  const sorted = Array.from(partnerMap.values()).sort((a, b) => b.count - a.count)
  console.log(
    "analyzeTransactionPartners - Top 3 partners:",
    sorted.slice(0, 3).map((p) => ({
      address: `${p.address.slice(0, 4)}...${p.address.slice(-4)}`,
      count: p.count,
      totalValue: p.totalValue,
    })),
  )

  return limit === Number.POSITIVE_INFINITY ? sorted : sorted.slice(0, limit)
}

/**
 * Analyze asset category preferences from transactions
 */
export function analyzeAssetPreferences(transactions: Transaction[]): AssetPreference[] {
  const categoryCount: Record<string, number> = {
    Stablecoin: 0,
    Meme: 0,
    Token: 0,
  }

  let totalAssets = 0

  transactions.forEach((tx) => {
    tx.attributes.transfers.forEach((transfer) => {
      const symbol = transfer.fungible_info?.symbol || ""
      const name = transfer.fungible_info?.name || ""
      const category = getTokenCategory(symbol, name)

      categoryCount[category]++
      totalAssets++
    })
  })

  return Object.entries(categoryCount).map(([category, count]) => ({
    category: category as "Stablecoin" | "Meme" | "Token",
    count,
    percentage: totalAssets > 0 ? (count / totalAssets) * 100 : 0,
  }))
}

/**
 * Find most active asset in transactions
 */
export function findMostActiveAsset(transactions: Transaction[]): { symbol: string; count: number } | null {
  const assetCount = new Map<string, number>()

  transactions.forEach((tx) => {
    tx.attributes.transfers.forEach((transfer) => {
      const symbol = transfer.fungible_info?.symbol
      if (symbol) {
        assetCount.set(symbol, (assetCount.get(symbol) || 0) + 1)
      }
    })
  })

  if (assetCount.size === 0) return null

  const sorted = Array.from(assetCount.entries()).sort((a, b) => b[1] - a[1])
  return {
    symbol: sorted[0][0],
    count: sorted[0][1],
  }
}

/**
 * Generate TreeMap data for most interacted wallets
 * @param transactions - Array of transactions to analyze
 * @param mainWalletAddress - The main wallet address to exclude from interactions
 * @param topN - Number of top wallets to include (default 50)
 */
export function generateTreeMapData(
  transactions: Transaction[],
  mainWalletAddress: string,
  topN = 50,
): TreeMapWallet[] {
  const partners = analyzeTransactionPartners(transactions, Number.POSITIVE_INFINITY)
  const mainWalletLower = mainWalletAddress.toLowerCase()

  // Filter out the main wallet and get top N partners
  const filteredPartners = partners
    .filter((partner) => partner.address.toLowerCase() !== mainWalletLower)
    .slice(0, topN)

  console.log(
    "generateTreeMapData - Using TransactionPartner data, Top 3 wallets:",
    filteredPartners.slice(0, 3).map((p) => ({
      address: `${p.address.slice(0, 4)}...${p.address.slice(-4)}`,
      count: p.count,
      totalValue: p.totalValue,
    })),
  )

  // Generate distinct colors for each wallet
  const colors = [
    "#3b82f6", // blue
    "#10b981", // green
    "#f59e0b", // amber
    "#ef4444", // red
    "#8b5cf6", // violet
    "#ec4899", // pink
    "#06b6d4", // cyan
    "#f97316", // orange
    "#14b8a6", // teal
    "#6b7280", // gray for others
  ]

  const treeMapData: TreeMapWallet[] = filteredPartners.map((partner, index) => ({
    name: `${partner.address.slice(0, 4)}...${partner.address.slice(-4)}`,
    address: partner.address,
    count: partner.count,
    value: partner.totalValue, // Use totalValue from TransactionPartner
    size: partner.count, // Size based on interaction count
    color: colors[index % colors.length], // Use modulo to ensure colors repeat if needed
    lastInteraction: partner.lastInteraction,
  }))

  const remainingPartners = partners.filter((partner) => partner.address.toLowerCase() !== mainWalletLower).slice(topN)

  if (remainingPartners.length > 0) {
    const othersData = remainingPartners.reduce(
      (acc, partner) => ({
        count: acc.count + partner.count,
        value: acc.value + partner.totalValue, // Use totalValue from TransactionPartner
      }),
      { count: 0, value: 0 },
    )

    console.log("generateTreeMapData - Others data:", {
      partnersCount: remainingPartners.length,
      totalCount: othersData.count,
      totalValue: othersData.value,
    })

    treeMapData.push({
      name: "Others",
      address: "others",
      count: othersData.count,
      value: othersData.value,
      size: othersData.count,
      color: colors[colors.length - 1],
      lastInteraction: "", // No specific last interaction for aggregated data
    })
  }

  return treeMapData
}

/**
 * Generate complete insights data from transactions
 */
export function generateInsightsData(transactions: Transaction[], mainWalletAddress: string): InsightsData {
  const topPartners = analyzeTransactionPartners(transactions, 10)
  const assetPreferences = analyzeAssetPreferences(transactions)
  const mostActiveAsset = findMostActiveAsset(transactions)
  const treeMapData = generateTreeMapData(transactions, mainWalletAddress)

  const uniquePartners = new Set<string>()
  transactions.forEach((tx) => {
    tx.attributes.transfers.forEach((transfer) => {
      if (transfer.sender && transfer.sender.toLowerCase() !== mainWalletAddress.toLowerCase()) {
        uniquePartners.add(transfer.sender)
      }
      if (transfer.recipient && transfer.recipient.toLowerCase() !== mainWalletAddress.toLowerCase()) {
        uniquePartners.add(transfer.recipient)
      }
    })
  })

  return {
    topPartners,
    assetPreferences,
    totalTransactions: transactions.length,
    uniquePartners: uniquePartners.size,
    mostActiveAsset,
    treeMapData,
  }
}
