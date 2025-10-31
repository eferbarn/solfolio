"use client"

/**
 * Top Transaction Partners Component
 * Displays most frequent transaction partners
 */

import { Card } from "@/components/ui/card"
import { ExternalLink } from "lucide-react"
import type { TransactionPartner } from "@/lib/utils/transaction-analysis"

interface TopPartnersProps {
  partners: TransactionPartner[]
  isLoading?: boolean
}

export function TopPartners({ partners, isLoading }: TopPartnersProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold">Top Transaction Partners</h3>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg border p-4">
              <div className="h-4 w-3/4 rounded bg-muted" />
            </div>
          ))}
        </div>
      </Card>
    )
  }

  if (!partners.length) {
    return (
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold">Top Transaction Partners</h3>
        <p className="text-center text-muted-foreground">No transaction partners found</p>
      </Card>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <Card className="p-6">
      <h3 className="mb-4 text-lg font-semibold">Top Transaction Partners</h3>
      <p className="mb-4 text-sm text-muted-foreground">
        Wallets you interact with most frequently (last 1000 transactions)
      </p>

      <div className="space-y-3">
        {partners.map((partner, index) => (
          <div
            key={partner.address}
            className="flex items-center justify-between rounded-lg border p-4 transition-shadow hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                #{index + 1}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-sm font-semibold">
                    {partner.address.slice(0, 8)}...{partner.address.slice(-6)}
                  </p>
                  <a
                    href={`https://solscan.io/account/${partner.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <p className="text-xs text-muted-foreground">Last: {formatDate(partner.lastInteraction)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">{partner.count}</p>
              <p className="text-xs text-muted-foreground">transactions</p>
              <p className="text-xs text-muted-foreground">
                ${partner.totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
