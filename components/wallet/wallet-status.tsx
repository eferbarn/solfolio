"use client"

/**
 * Wallet Status Component
 * Displays connection status and errors
 */

import { useWallet } from "@/lib/wallet/context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export function WalletStatus() {
  const { error } = useWallet()

  if (!error) return null

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  )
}
