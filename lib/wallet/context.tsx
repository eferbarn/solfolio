"use client"

/**
 * Wallet Context Provider
 * Manages Solana wallet connection state
 */

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"

export interface WalletContextType {
  address: string | null
  isConnected: boolean
  isConnecting: boolean
  connect: (address: string) => void
  disconnect: () => void
  error: string | null
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load saved wallet address from localStorage on mount
  useEffect(() => {
    const savedAddress = localStorage.getItem("solana_wallet_address")
    if (savedAddress) {
      setAddress(savedAddress)
    }
  }, [])

  const connect = useCallback((walletAddress: string) => {
    setIsConnecting(true)
    setError(null)

    try {
      // Validate Solana address format (basic validation)
      if (!walletAddress || walletAddress.length < 32) {
        throw new Error("Invalid Solana wallet address")
      }

      setAddress(walletAddress)
      localStorage.setItem("solana_wallet_address", walletAddress)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect wallet")
      setAddress(null)
    } finally {
      setIsConnecting(false)
    }
  }, [])

  const disconnect = useCallback(() => {
    setAddress(null)
    setError(null)
    localStorage.removeItem("solana_wallet_address")
  }, [])

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected: !!address,
        isConnecting,
        connect,
        disconnect,
        error,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}
