"use client"

/**
 * Wallet Connect Button Component
 * Allows users to input their Solana wallet address
 */

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useWallet } from "@/lib/wallet/context"
import { Wallet, LogOut } from "lucide-react"

export function WalletConnectButton() {
  const { address, isConnected, isConnecting, connect, disconnect } = useWallet()
  const [inputAddress, setInputAddress] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const handleConnect = () => {
    if (inputAddress.trim()) {
      connect(inputAddress.trim())
      setIsOpen(false)
      setInputAddress("")
    }
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2">
          <Wallet className="h-4 w-4 text-muted-foreground" />
          <span className="font-mono text-sm">{formatAddress(address)}</span>
        </div>
        <Button variant="outline" size="icon" onClick={disconnect} title="Disconnect wallet">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default" disabled={isConnecting}>
          <Wallet className="mr-2 h-4 w-4" />
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Solana Wallet</DialogTitle>
          <DialogDescription>Enter your Solana wallet address to view your portfolio and PnL.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Input
            placeholder="Enter Solana wallet address"
            value={inputAddress}
            onChange={(e) => setInputAddress(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleConnect()
              }
            }}
            className="font-mono"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConnect} disabled={!inputAddress.trim()}>
              Connect
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
