/**
 * API Route: Get chart data for assets
 */

import { type NextRequest, NextResponse } from "next/server"
import { getFungibleChart } from "@/lib/zerion/charts"
import { ZerionAPIError } from "@/lib/zerion/client"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const fungibleId = searchParams.get("fungibleId")
    const period = (searchParams.get("period") as any) || "1d"

    if (!fungibleId) {
      return NextResponse.json({ error: "Fungible ID is required" }, { status: 400 })
    }

    const chartData = await getFungibleChart({ fungibleId, period })

    return NextResponse.json({
      data: chartData,
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error("[Chart API Error]", error)

    if (error instanceof ZerionAPIError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode || 500 })
    }

    return NextResponse.json({ error: "Failed to fetch chart data" }, { status: 500 })
  }
}
