"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Treemap, ResponsiveContainer, Tooltip } from "recharts"
import { ExternalLink } from "lucide-react"
import type { TreeMapWallet, TransactionPartner } from "@/lib/utils/transaction-analysis"

interface WalletTreeMapProps {
  data: TreeMapWallet[]
  topPartners: TransactionPartner[]
  isLoading?: boolean
}

interface CustomContentProps {
  x?: number
  y?: number
  width?: number
  height?: number
  depth?: number
  index?: number
  name?: string
  address?: string
  count?: number
  value?: number
  size?: number
  color?: string
  root?: any
  payload?: any
}

const CustomTreeMapContent = (props: CustomContentProps) => {
  const { x = 0, y = 0, width = 0, height = 0, payload } = props

  // Get data from payload (Recharts passes data this way)
  const data = payload || props
  const { name, address, count, value, color } = data

  // Only render text if the cell is large enough
  const showText = width > 60 && height > 50

  const handleClick = () => {
    if (address && address !== "others") {
      window.open(`https://solscan.io/account/${address}`, "_blank", "noopener,noreferrer")
    }
  }

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={color || "#8884d8"}
        stroke="#fff"
        strokeWidth={2}
        className={address !== "others" ? "cursor-pointer transition-opacity hover:opacity-80" : ""}
        onClick={handleClick}
      />
      {showText && name && count !== undefined && (
        <>
          <text
            x={x + width / 2}
            y={y + height / 2 - 10}
            textAnchor="middle"
            fill="#fff"
            fontSize={14}
            fontWeight="bold"
          >
            {name}
          </text>
          <text x={x + width / 2} y={y + height / 2 + 10} textAnchor="middle" fill="#fff" fontSize={12}>
            {count} txs
          </text>
        </>
      )}
    </g>
  )
}

const CustomTooltip = ({ active, payload, topPartners }: any) => {
  if (!active || !payload || !payload.length) return null

  const data = payload[0].payload as TreeMapWallet

  const partner = topPartners?.find((p: TransactionPartner) => p.address.toLowerCase() === data.address.toLowerCase())

  // Use TransactionPartner.totalValue if available, otherwise fall back to TreeMapWallet.value
  const totalValue = partner?.totalValue ?? data.value

  return (
    <Card className="border-2">
      <CardContent className="p-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="font-mono text-sm font-semibold">{data.name}</p>
            {data.address !== "others" && (
              <a
                href={`https://solscan.io/account/${data.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-foreground"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
          <div className="space-y-1 text-xs">
            <p className="text-muted-foreground">
              <span className="font-medium">Interactions:</span> {data.count.toLocaleString()}
            </p>
            {data.address !== "others" && (
              <p className="text-muted-foreground">
                <span className="font-medium">Total Transferred:</span> $
                {totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            )}
            {data.lastInteraction && (
              <p className="text-muted-foreground">
                <span className="font-medium">Last Interaction:</span> {data.lastInteraction}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function WalletTreeMap({ data, topPartners, isLoading }: WalletTreeMapProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction/Interest Tree</CardTitle>
          <CardDescription>Most interacted wallets based on last 1000 transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[400px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction/Interest Tree</CardTitle>
          <CardDescription>Most interacted wallets based on last 1000 transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[400px] items-center justify-center text-muted-foreground">
            No transaction data available
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction/Interest Tree</CardTitle>
        <CardDescription>
          Most interacted wallets based on last 1000 transactions. Hover to see total transferred assets. Click to view
          on Solscan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <Treemap data={data} dataKey="size" stroke="#fff" fill="#8884d8" content={CustomTreeMapContent}>
            <Tooltip content={<CustomTooltip topPartners={topPartners} />} />
          </Treemap>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
