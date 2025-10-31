"use client"

/**
 * Bubble Network Visualization Component
 * Displays transaction relationships as an interactive bubble chart
 */

import { Card } from "@/components/ui/card"
import { useMemo } from "react"
import type { TransactionPartner } from "@/lib/utils/transaction-analysis"

interface BubbleNetworkProps {
  partners: TransactionPartner[]
  walletAddress: string
  isLoading?: boolean
}

export function BubbleNetwork({ partners, walletAddress, isLoading }: BubbleNetworkProps) {
  const bubbleData = useMemo(() => {
    if (!partners.length) return []

    // Calculate bubble sizes based on transaction count
    const maxCount = Math.max(...partners.map((p) => p.count))
    const minSize = 40
    const maxSize = 120

    return partners.map((partner, index) => {
      const size = minSize + (partner.count / maxCount) * (maxSize - minSize)
      const angle = (index / partners.length) * 2 * Math.PI
      const radius = 150

      return {
        ...partner,
        size,
        x: 250 + radius * Math.cos(angle),
        y: 250 + radius * Math.sin(angle),
        color: `hsl(${(index * 360) / partners.length}, 70%, 60%)`,
      }
    })
  }, [partners])

  if (isLoading) {
    return (
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold">Transaction Network</h3>
        <div className="flex h-[500px] items-center justify-center">
          <p className="text-muted-foreground">Loading network data...</p>
        </div>
      </Card>
    )
  }

  if (!partners.length) {
    return (
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold">Transaction Network</h3>
        <div className="flex h-[500px] items-center justify-center">
          <p className="text-muted-foreground">No transaction partners found</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h3 className="mb-4 text-lg font-semibold">Transaction Network</h3>
      <p className="mb-4 text-sm text-muted-foreground">
        Bubble size represents transaction frequency. Hover for details.
      </p>

      <div className="relative h-[500px] w-full overflow-hidden rounded-lg border bg-muted/20">
        <svg width="100%" height="100%" viewBox="0 0 500 500">
          {/* Center wallet bubble */}
          <g>
            <circle cx="250" cy="250" r="60" fill="hsl(var(--primary))" opacity="0.8" />
            <text
              x="250"
              y="250"
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-primary-foreground text-xs font-semibold"
            >
              Your Wallet
            </text>
          </g>

          {/* Connection lines */}
          {bubbleData.map((bubble, index) => (
            <line
              key={`line-${index}`}
              x1="250"
              y1="250"
              x2={bubble.x}
              y2={bubble.y}
              stroke="hsl(var(--border))"
              strokeWidth="2"
              strokeDasharray="4 4"
              opacity="0.3"
            />
          ))}

          {/* Partner bubbles */}
          {bubbleData.map((bubble, index) => (
            <g key={`bubble-${index}`} className="cursor-pointer transition-transform hover:scale-110">
              <circle cx={bubble.x} cy={bubble.y} r={bubble.size / 2} fill={bubble.color} opacity="0.7" />
              <text
                x={bubble.x}
                y={bubble.y - 5}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-foreground text-xs font-semibold"
              >
                {bubble.count}
              </text>
              <text
                x={bubble.x}
                y={bubble.y + 8}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-muted-foreground text-[10px]"
              >
                txs
              </text>
              <title>
                {`Address: ${bubble.address.slice(0, 8)}...${bubble.address.slice(-6)}\nTransactions: ${bubble.count}\nTotal Value: $${bubble.totalValue.toFixed(2)}`}
              </title>
            </g>
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm md:grid-cols-3">
        {bubbleData.slice(0, 6).map((bubble, index) => (
          <div key={`legend-${index}`} className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: bubble.color }} />
            <span className="truncate text-xs text-muted-foreground">
              {bubble.address.slice(0, 6)}...{bubble.address.slice(-4)}
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}
