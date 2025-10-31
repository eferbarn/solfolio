"use client"
import { useWallet } from "@/lib/wallet/context"
import { usePortfolio } from "@/hooks/use-portfolio"
import { useLocalStorage } from "@/lib/hooks/use-local-storage"
import { WalletSearch } from "@/components/wallet/wallet-search"
import { WalletStatus } from "@/components/wallet/wallet-status"
import { PortfolioHeader } from "@/components/portfolio/portfolio-header"
import { PortfolioStats } from "@/components/portfolio/portfolio-stats"
import { PositionsList } from "@/components/portfolio/positions-list"
import { PnLSummary } from "@/components/charts/pnl-summary"
import { AssetAllocation } from "@/components/charts/asset-allocation"
import { AutoRefreshIndicator } from "@/components/portfolio/auto-refresh-indicator"
import { RefreshSettings } from "@/components/portfolio/refresh-settings"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, ArrowUpRight, ArrowDownLeft, ExternalLink, Lightbulb, Wallet, ArrowLeftRight } from "lucide-react"
import { useState, useMemo, useEffect } from "react"
import { calculateRealizedPnL } from "@/lib/zerion/transactions"
import type { Transaction } from "@/lib/zerion/types"
import { getTokenCategory, type TokenCategoryCounts } from "@/lib/utils/token-categories"
import { InsightsStats } from "@/components/insights/insights-stats"
import { AssetPreferences } from "@/components/insights/asset-preferences"
import { WalletTreeMap } from "@/components/insights/wallet-treemap"
import { generateInsightsData } from "@/lib/utils/transaction-analysis"
import { getCachedInsights, setCachedInsights, formatCacheExpiry } from "@/lib/utils/insights-cache"
import type { InsightsData } from "@/lib/utils/transaction-analysis"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const ITEMS_PER_PAGE = 20

export default function DashboardPage() {
  const { address, isConnected } = useWallet()
  const [refreshInterval, setRefreshInterval] = useLocalStorage("portfolio_refresh_interval", 30000)
  const [sortBy, setSortBy] = useState<string>("highest-holding")
  const [realizedPnL, setRealizedPnL] = useState<{
    total: number
    trades: number
  } | null>(null)
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false)
  const [activeTab, setActiveTab] = useState<"portfolio" | "transactions" | "insights">("portfolio")
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [insightsData, setInsightsData] = useState<InsightsData | null>(null)
  const [isLoadingInsights, setIsLoadingInsights] = useState(false)
  const [cacheInfo, setCacheInfo] = useState<string | null>(null)
  const [isValidCache, setIsValidCache] = useState<boolean>(true) // Declare isValidCache

  const { data, isLoading, error, lastUpdated, refetch } = usePortfolio(address, {
    refreshInterval,
    enabled: isConnected,
  })

  useEffect(() => {
    if (!address || !isConnected) {
      setRealizedPnL(null)
      setTransactions([])
      setInsightsData(null)
      return
    }

    const fetchTransactions = async () => {
      setIsLoadingTransactions(true)
      try {
        const response = await fetch(`/api/transactions?address=${address}`)
        if (!response.ok) {
          throw new Error("Failed to fetch transactions")
        }
        const { transactions: txs } = (await response.json()) as {
          transactions: Transaction[]
        }
        setTransactions(txs)
        const pnl = calculateRealizedPnL(txs)
        setRealizedPnL(pnl)
      } catch (error) {
        console.error("Error fetching transactions:", error)
        setRealizedPnL({ total: 0, trades: 0 })
        setTransactions([])
      } finally {
        setIsLoadingTransactions(false)
      }
    }

    fetchTransactions()
  }, [address, isConnected])

  useEffect(() => {
    if (!address || !isConnected || activeTab !== "insights") {
      return
    }

    const loadInsights = async () => {
      // Check cache first
      const cached = getCachedInsights(address)
      if (cached) {
        console.log("Using cached insights data")
        setInsightsData(cached.data)
        setCacheInfo(`Cache expires in ${formatCacheExpiry(cached)}`)
        return
      }

      if (cached && !isValidCache) {
        console.log("Cache invalid - refreshing data (treeMapData missing, incomplete, or contains main wallet)")
      }

      // Fetch fresh data
      setIsLoadingInsights(true)
      try {
        // Fetch up to 1000 transactions for insights
        console.log("Fetching 1000 transactions for insights analysis")
        const response = await fetch(`/api/transactions?address=${address}&pageSize=1000`)
        if (!response.ok) {
          throw new Error("Failed to fetch transactions for insights")
        }
        const { transactions: txs } = (await response.json()) as {
          transactions: Transaction[]
        }
        console.log("Fetched transactions for insights:", txs.length)

        const insights = generateInsightsData(txs, address)
        console.log("Generated insights treeMapData:", insights.treeMapData)
        setInsightsData(insights)
        setCachedInsights(address, insights)
        setCacheInfo("Data cached for 6 hours")
      } catch (error) {
        console.error("Error loading insights:", error)
      } finally {
        setIsLoadingInsights(false)
      }
    }

    loadInsights()
  }, [address, isConnected, activeTab])

  const transactionStats = useMemo(() => {
    const totalTransactions = transactions.length
    const sentCount = transactions.filter((tx) => tx.attributes.operation_type === "send").length
    const receivedCount = transactions.filter((tx) => tx.attributes.operation_type === "receive").length
    const tradedCount = transactions.filter(
      (tx) => tx.attributes.operation_type === "trade" || tx.attributes.operation_type === "swap",
    ).length

    const totalGasSpent = transactions.reduce((sum, tx) => {
      if (tx.attributes.fee && tx.attributes.fee.fungible_info.symbol === "SOL") {
        return sum + Number(tx.attributes.fee.quantity.numeric)
      }
      return sum
    }, 0)

    return {
      total: totalTransactions,
      sent: sentCount,
      received: receivedCount,
      traded: tradedCount,
      gasSpent: totalGasSpent,
    }
  }, [transactions])

  const sortedPositions = useMemo(() => {
    if (!data?.positions) return []

    const positions = [...data.positions]

    switch (sortBy) {
      case "positive-pnl":
        return positions.sort((a, b) => {
          const aChange = a.attributes.changes?.percent_1d ?? 0
          const bChange = b.attributes.changes?.percent_1d ?? 0
          return bChange - aChange
        })
      case "negative-pnl":
        return positions.sort((a, b) => {
          const aChange = a.attributes.changes?.percent_1d ?? 0
          const bChange = b.attributes.changes?.percent_1d ?? 0
          return aChange - bChange
        })
      case "highest-holding":
        return positions.sort((a, b) => {
          const aValue = a.attributes.value || 0
          const bValue = b.attributes.value || 0
          return bValue - aValue
        })
      case "lowest-holding":
        return positions.sort((a, b) => {
          const aValue = a.attributes.value || 0
          const bValue = b.attributes.value || 0
          return aValue - bValue
        })
      default:
        return positions
    }
  }, [data?.positions, sortBy])

  const totalPositions = data?.positions.length || 0
  const largestPosition = data?.positions.reduce(
    (largest, pos) => {
      const value = pos.attributes.value || 0
      if (!largest || value > largest.value) {
        return {
          symbol: pos.attributes.fungible_info.symbol || "Unknown",
          value,
        }
      }
      return largest
    },
    null as { symbol: string; value: number } | null,
  )

  const performerData = data?.positions.reduce(
    (result, pos) => {
      const change = pos.attributes.changes?.percent_1d ?? 0
      const symbol = pos.attributes.fungible_info.symbol || "Unknown"

      // Track the highest change for top performer
      if (!result.top || change > result.top.change) {
        result.top = { symbol, change }
      }

      // Track the lowest change for biggest loss
      if (!result.bottom || change < result.bottom.change) {
        result.bottom = { symbol, change }
      }

      // Check if we have any positive performers
      if (change > 0) {
        result.hasPositive = true
      }

      return result
    },
    {
      top: null as { symbol: string; change: number } | null,
      bottom: null as { symbol: string; change: number } | null,
      hasPositive: false,
    },
  )

  const topPerformer = performerData?.hasPositive ? performerData.top : performerData?.bottom
  const isTopPerformer = performerData?.hasPositive ?? false

  const unrealizedPnL = data?.pnl24h.absolute || 0
  const totalPnL = (realizedPnL?.total || 0) + unrealizedPnL

  const filteredTransactions = transactions.filter((tx) => {
    if (categoryFilter === "all") return true
    return tx.attributes.operation_type === categoryFilter
  })

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE)
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  )

  const categories = Array.from(new Set(transactions.map((tx) => tx.attributes.operation_type)))

  const getOperationIcon = (type: string) => {
    switch (type) {
      case "receive":
        return <ArrowDownLeft className="h-4 w-4 text-green-600" />
      case "send":
        return <ArrowUpRight className="h-4 w-4 text-red-600" />
      case "trade":
      case "swap":
        return <RefreshCw className="h-4 w-4 text-blue-600" />
      default:
        return <RefreshCw className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getOperationColor = (type: string) => {
    switch (type) {
      case "receive":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "send":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "trade":
      case "swap":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const refetchTransactions = async () => {
    if (!address) return
    setIsLoadingTransactions(true)
    try {
      const response = await fetch(`/api/transactions?address=${address}`)
      if (!response.ok) {
        throw new Error("Failed to fetch transactions")
      }
      const { transactions: txs } = (await response.json()) as {
        transactions: Transaction[]
      }
      setTransactions(txs)
    } catch (error) {
      console.error("Error fetching transactions:", error)
    } finally {
      setIsLoadingTransactions(false)
    }
  }

  const tokenCategoryCounts = useMemo<TokenCategoryCounts>(() => {
    if (!data?.positions) {
      return { Stablecoin: 0, Meme: 0, Token: 0 }
    }

    const counts: TokenCategoryCounts = {
      Stablecoin: 0,
      Meme: 0,
      Token: 0,
    }

    data.positions.forEach((position) => {
      const category = getTokenCategory(
        position.attributes.fungible_info.symbol,
        position.attributes.fungible_info.name,
      )
      counts[category]++
    })

    console.log("Token category counts:", counts)
    return counts
  }, [data?.positions])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold">Solfolio</h1>
            <p className="text-sm text-muted-foreground">Solana Real-time Portfolio Tracker and PnL Analysis</p>
          </div>
          <div className="flex items-center gap-3">
            {isConnected && (
              <>
                <RefreshSettings currentInterval={refreshInterval} onIntervalChange={setRefreshInterval} />
                <Button variant="outline" size="icon" onClick={refetch} disabled={isLoading} title="Refresh data">
                  <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                </Button>
                <WalletSearch variant="compact" />
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <WalletStatus />

        {!isConnected ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-6">
              <img src="/logo.png" alt="Solfolio Logo" className="h-24 w-24 rounded-2xl" />
            </div>
            <h2 className="mb-2 text-2xl font-bold">Track Your Solana Portfolio</h2>
            <p className="mb-6 max-w-md text-muted-foreground">
              Enter any Solana wallet address to view real-time portfolio balances, track positions, and analyze profit
              & loss.
            </p>
            <WalletSearch />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-lg text-destructive">{error}</p>
            <Button onClick={refetch} className="mt-4">
              Try Again
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Auto-refresh indicator */}
            {refreshInterval > 0 && activeTab === "portfolio" && (
              <div className="flex justify-end">
                <AutoRefreshIndicator
                  lastUpdated={lastUpdated}
                  refreshInterval={refreshInterval}
                  isLoading={isLoading}
                />
              </div>
            )}

            <TooltipProvider>
              <div className="flex gap-2 border-b border-border">
                <button
                  onClick={() => setActiveTab("portfolio")}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === "portfolio"
                      ? "border-b-2 border-primary text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Wallet className="h-4 w-4" />
                  Portfolio
                </button>
                <button
                  onClick={() => setActiveTab("transactions")}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === "transactions"
                      ? "border-b-2 border-primary text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <ArrowLeftRight className="h-4 w-4" />
                  Transactions
                </button>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setActiveTab("insights")}
                      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                        activeTab === "insights"
                          ? "border-b-2 border-primary text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Lightbulb className="h-4 w-4" />
                      Insights
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-sm">
                      Insights data is cached for 6 hours to optimize performance and reduce API calls. The cache
                      automatically refreshes after expiration.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>

            <PortfolioHeader
              totalValue={data?.totalValue || 0}
              pnl24h={data?.pnl24h || { absolute: 0, percent: 0 }}
              totalPnL={totalPnL}
              transactionStats={transactionStats}
              isLoading={isLoading}
            />

            {activeTab === "portfolio" ? (
              <>
                {/* Stats */}
                <PortfolioStats
                  totalPositions={totalPositions}
                  largestPosition={largestPosition || undefined}
                  topPerformer={topPerformer || undefined}
                  isTopPerformer={isTopPerformer}
                  isLoading={isLoading}
                />

                <PnLSummary
                  totalPnL={totalPnL}
                  realizedPnL={realizedPnL?.total || 0}
                  unrealizedPnL={unrealizedPnL}
                  isLoading={isLoading}
                />

                <AssetAllocation
                  positions={data?.positions || []}
                  totalValue={data?.totalValue || 0}
                  isLoading={isLoading}
                />

                {/* Positions */}
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold">Positions</h2>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="highest-holding">Highest Holding</SelectItem>
                        <SelectItem value="lowest-holding">Lowest Holding</SelectItem>
                        <SelectItem value="positive-pnl">+ PnL</SelectItem>
                        <SelectItem value="negative-pnl">- PnL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <PositionsList positions={sortedPositions} isLoading={isLoading} />
                </div>
              </>
            ) : activeTab === "transactions" ? (
              <>
                <div className="space-y-6">
                  {/* Filters */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Filter by type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground">
                        {filteredTransactions.length} transaction
                        {filteredTransactions.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={refetchTransactions} disabled={isLoadingTransactions}>
                      <RefreshCw className={`mr-2 h-4 w-4 ${isLoadingTransactions ? "animate-spin" : ""}`} />
                      Refresh
                    </Button>
                  </div>

                  {/* Transactions List */}
                  {isLoadingTransactions ? (
                    <div className="space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <Card key={i} className="p-4">
                          <div className="animate-pulse space-y-3">
                            <div className="h-4 w-1/4 rounded bg-muted" />
                            <div className="h-3 w-1/2 rounded bg-muted" />
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : paginatedTransactions.length === 0 ? (
                    <Card className="p-8 text-center">
                      <p className="text-muted-foreground">No transactions found</p>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {paginatedTransactions.map((tx) => (
                        <Card key={tx.id} className="p-4 transition-shadow hover:shadow-md">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <div className="mt-1">{getOperationIcon(tx.attributes.operation_type)}</div>
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                  <Badge className={getOperationColor(tx.attributes.operation_type)}>
                                    {tx.attributes.operation_type}
                                  </Badge>
                                  <Badge variant="outline" className="font-mono text-xs">
                                    {tx.attributes.status}
                                  </Badge>
                                </div>
                                <div className="space-y-1">
                                  {tx.attributes.transfers.map((transfer, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-sm">
                                      <span className={transfer.direction === "in" ? "text-green-600" : "text-red-600"}>
                                        {transfer.direction === "in" ? "+" : "-"}
                                      </span>
                                      <span className="font-medium">
                                        {Number(transfer.quantity.numeric).toLocaleString(undefined, {
                                          maximumFractionDigits: 6,
                                        })}
                                      </span>
                                      <span className="text-muted-foreground">{transfer.fungible_info.symbol}</span>
                                      {transfer.value && (
                                        <span className="text-muted-foreground">
                                          ($
                                          {transfer.value.toLocaleString(undefined, { minimumFractionDigits: 2 })})
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                                <p className="text-xs text-muted-foreground">{formatDate(tx.attributes.mined_at)}</p>
                              </div>
                            </div>
                            <a
                              href={`https://solscan.io/tx/${tx.attributes.hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground transition-colors hover:text-foreground"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </div>
                          {tx.attributes.fee && (
                            <div className="mt-3 border-t pt-3 text-xs text-muted-foreground">
                              Fee: {Number(tx.attributes.fee.quantity.numeric).toFixed(6)}{" "}
                              {tx.attributes.fee.fungible_info.symbol} ($
                              {tx.attributes.fee?.value?.toFixed(4) ?? 0})
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="space-y-6">
                  {/* Insights Stats */}
                  {insightsData && <InsightsStats data={insightsData} isLoading={isLoadingInsights} />}

                  {/* Asset Preferences */}
                  {insightsData && (
                    <AssetPreferences preferences={insightsData.assetPreferences} isLoading={isLoadingInsights} />
                  )}

                  {/* Wallet TreeMap */}
                  {insightsData && (
                    <WalletTreeMap
                      data={insightsData.treeMapData}
                      topPartners={insightsData.topPartners}
                      isLoading={isLoadingInsights}
                    />
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
