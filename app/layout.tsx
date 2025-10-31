import type React from "react"
import type { Metadata } from "next"

import { Analytics } from "@vercel/analytics/next"
import { WalletProvider } from "@/lib/wallet/context"
import { ThemeProvider } from "@/components/theme-provider"
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
  description: "Solfolio: Solana Portfolio Tracker - Powered by Zerion API",
  generator: "solfolio.eferbarn.com",
  icons: {
    icon: "/logo.png",
  },
  openGraph: {
    title: "Solfolio",
    description: "Solfolio: Solana Portfolio Tracker - Powered by Zerion API",
    url: "https://solfolio.eferbarn.com",
    siteName: "Solfolio",
    images: [
      {
        url: "/banner.png",
        width: 1200,
        height: 630,
        alt: "Solfolio - Solana Portfolio Tracker",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Solfolio",
    description: "Solfolio: Solana Portfolio Tracker - Powered by Zerion API",
    images: ["/banner.png"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="solfolio-theme">
          <WalletProvider>{children}</WalletProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
