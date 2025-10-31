"use client"

/**
 * Wallet Search Component
 * Simple search box for entering Solana wallet addresses
 */

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"
import { useWallet } from "@/lib/wallet/context"

interface WalletSearchProps {
  variant?: "default" | "compact"
}

export function WalletSearch({ variant = "default" }: WalletSearchProps) {
  const { address, isConnected, connect, disconnect } = useWallet()
  const [inputAddress, setInputAddress] = useState("")

  const handleSearch = () => {
    if (inputAddress.trim()) {
      connect(inputAddress.trim())
      setInputAddress("")
    }
  }

  const handleDisconnect = () => {
    disconnect()
    setInputAddress("")
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`
  }

  if (isConnected && address && variant === "compact") {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
          <span className="font-mono text-sm">{formatAddress(address)}</span>
        </div>
        <Button variant="ghost" size="icon" onClick={handleDisconnect} title="Clear wallet">
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-2">
        <Input
          placeholder="Enter Solana address"
          value={inputAddress}
          onChange={(e) => setInputAddress(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch()
            }
          }}
          className="w-64 font-mono text-sm"
        />
        <Button onClick={handleSearch} disabled={!inputAddress.trim()} size="sm">
          <Search className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  // Default variant - large centered search
  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="flex gap-2">
        <Input
          placeholder="Enter Solana wallet address"
          value={inputAddress}
          onChange={(e) => setInputAddress(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch()
            }
          }}
          className="font-mono"
        />
        <Button onClick={handleSearch} disabled={!inputAddress.trim()}>
          <Search className="mr-2 h-4 w-4" />
          Search
        </Button>
      </div>
    </div>
  )
}
