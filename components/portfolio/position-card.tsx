"use client"

/**
 * Position Card Component
 * Displays individual token position
 */

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Position } from "@/lib/zerion/types"
import { TrendingUp, TrendingDown, ExternalLink } from "lucide-react"
import { getTokenCategory, getCategoryColor } from "@/lib/utils/token-categories"

interface PositionCardProps {
  position: Position
}

export function PositionCard({ position }: PositionCardProps) {
  const { fungible_info, quantity, value, price, changes } = position.attributes
  const change24h = changes?.percent_1d ?? 0
  const isPositive = change24h >= 0

  const category = getTokenCategory(fungible_info.symbol, fungible_info.name)
  const categoryColor = getCategoryColor(category)

  const solanaImplementation = fungible_info.implementations?.find((impl) => impl.chain_id === "solana")
  const tokenAddress = solanaImplementation?.address

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {fungible_info.icon?.url && (
            <img
              src={fungible_info.icon.url || "/placeholder.svg"}
              alt={fungible_info.symbol}
              className="h-10 w-10 rounded-full"
            />
          )}
          <div>
            <h3 className="font-semibold text-lg">{fungible_info.symbol || "Unknown"}</h3>
            <p className="text-sm text-muted-foreground">{fungible_info.name || "Unknown Token"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={categoryColor}>{category}</Badge>
          {tokenAddress && (
            <a
              href={`https://solscan.io/token/${tokenAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-foreground"
              title="View on Solscan"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-muted-foreground">Balance</p>
          <p className="font-mono text-sm font-medium">
            {Number.parseFloat(quantity.numeric).toLocaleString("en-US", {
              maximumFractionDigits: 6,
            })}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Value</p>
          <p className="font-semibold">
            ${value?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Price</p>
          <p className="font-mono text-sm">
            ${price?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 }) || "0.00"}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">24h Change</p>
          {changes ? (
            <div className="flex items-center gap-1">
              {isPositive ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <span className={`text-sm font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}>
                {isPositive ? "+" : ""}
                {change24h.toFixed(2)}%
              </span>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">N/A</span>
          )}
        </div>
      </div>
    </Card>
  )
}
