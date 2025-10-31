import { type NextRequest, NextResponse } from "next/server"
import { getWalletTransactions, getWalletTransactionsPaginated } from "@/lib/zerion/transactions"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const address = searchParams.get("address")
    const pageSize = Number.parseInt(searchParams.get("pageSize") || "100", 10)

    if (!address) {
      return NextResponse.json({ error: "Wallet address is required" }, { status: 400 })
    }

    console.log("Fetching transactions for address:", address, "pageSize:", pageSize)

    const transactions =
      pageSize > 100
        ? await getWalletTransactionsPaginated({
            walletAddress: address,
            currency: "usd",
            maxTransactions: pageSize,
          })
        : await getWalletTransactions({
            walletAddress: address,
            currency: "usd",
            pageSize,
          })

    console.log("Fetched transactions count:", transactions.length)

    return NextResponse.json({ transactions })
  } catch (error) {
    console.error("[Transactions API Error]", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch transactions" },
      { status: 500 },
    )
  }
}
