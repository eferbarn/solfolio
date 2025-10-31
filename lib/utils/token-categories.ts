/**
 * Token categorization utilities
 * Categorizes tokens into Stablecoin, Meme, or Token types
 */

export type TokenCategory = "Stablecoin" | "Meme" | "Token"

const STABLECOINS = ["USDT", "USDC", "DAI", "BUSD", "TUSD", "USDD", "USDP", "GUSD", "PYUSD", "FDUSD"]

const MEME_KEYWORDS = [
  "DOGE",
  "SHIB",
  "PEPE",
  "FLOKI",
  "BONK",
  "WIF",
  "MEME",
  "ELON",
  "WOJAK",
  "CHAD",
  "MOON",
  "SAFE",
  "INU",
  "BABY",
  "MINI",
]

export function getTokenCategory(symbol: string, name: string): TokenCategory {
  const upperSymbol = symbol.toUpperCase()
  const upperName = name.toUpperCase()

  // Check if it's a stablecoin
  if (STABLECOINS.includes(upperSymbol)) {
    return "Stablecoin"
  }

  // Check if it's a meme token
  if (MEME_KEYWORDS.some((keyword) => upperSymbol.includes(keyword) || upperName.includes(keyword))) {
    return "Meme"
  }

  // Default to regular token
  return "Token"
}

export function getCategoryColor(category: TokenCategory): string {
  switch (category) {
    case "Stablecoin":
      return "bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700"
    case "Meme":
      return "bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-200 dark:border-red-700"
    case "Token":
      return "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700"
  }
}

export interface TokenCategoryCounts {
  Stablecoin: number
  Meme: number
  Token: number
}
