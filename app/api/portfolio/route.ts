/**
 * API Route: Get wallet portfolio data
 */

import { type NextRequest, NextResponse } from "next/server"
import { getWalletPositions, getWalletPortfolio } from "@/lib/zerion/portfolio"
import { ZerionAPIError } from "@/lib/zerion/client"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const walletAddress = searchParams.get("address")
    const chainId = searchParams.get("chainId") || undefined

    console.log("Portfolio API Request - walletAddress:", walletAddress, "chainId:", chainId)

    if (!walletAddress) {
      console.log("Portfolio API Error: Missing wallet address")
      return NextResponse.json({ error: "Wallet address is required" }, { status: 400 })
    }

    // Fetch positions and portfolio data in parallel
    const [positions, portfolio] = await Promise.all([
      getWalletPositions({ walletAddress, chainId }),
      getWalletPortfolio(walletAddress),
    ])

    console.log("Portfolio API Success - positions count:", positions.length)

    return NextResponse.json({
      positions,
      portfolio,
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error("[Portfolio API Error]", error)

    if (error instanceof ZerionAPIError) {
      return NextResponse.json({ error: error.message, details: error.response }, { status: error.statusCode || 500 })
    }

    return NextResponse.json({ error: "Failed to fetch portfolio data" }, { status: 500 })
  }
}
