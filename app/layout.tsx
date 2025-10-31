import type React from "react"
import type { Metadata } from "next"

import { Analytics } from "@vercel/analytics/next"
import { WalletProvider } from "@/lib/wallet/context"
import "./globals.css"

import { DM_Sans, Space_Mono, Geist as Font_Geist, Source_Serif_4 as Font_Source_Serif_4 } from "next/font/google"

// Initialize fonts
const _geist = Font_Geist({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
})
const _sourceSerif_4 = Font_Source_Serif_4({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
})

const dmSans = DM_Sans({ subsets: ["latin"] })
const spaceMono = Space_Mono({ weight: ["400", "700"], subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Solfolio",
  description: "Solana Real-time Portfolio Tracker and PnL analysis",
  generator: "solfolio.eferbarn.com",
  icons: {
    icon: "/logo.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <WalletProvider>{children}</WalletProvider>
        <Analytics />
      </body>
    </html>
  )
}
