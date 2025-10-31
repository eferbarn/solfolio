"use client"

/**
 * Positions List Component
 * Displays all portfolio positions grouped by category
 */

import { PositionCard } from "./position-card"
import { Skeleton } from "@/components/ui/skeleton"
import type { Position } from "@/lib/zerion/types"
import { getTokenCategory, type TokenCategory } from "@/lib/utils/token-categories"
import { useMemo } from "react"

interface PositionsListProps {
  positions: Position[]
  isLoading?: boolean
}

export function PositionsList({ positions, isLoading }: PositionsListProps) {
  const groupedPositions = useMemo(() => {
    const groups: Record<TokenCategory, Position[]> = {
      Stablecoin: [],
      Meme: [],
      Token: [],
    }

    positions.forEach((position) => {
      const category = getTokenCategory(
        position.attributes.fungible_info.symbol,
        position.attributes.fungible_info.name,
      )
      groups[category].push(position)
    })

    return groups
  }, [positions])

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    )
  }

  if (positions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg text-muted-foreground">No positions found</p>
        <p className="text-sm text-muted-foreground">This wallet doesn't have any assets yet</p>
      </div>
    )
  }

  const categories: TokenCategory[] = ["Stablecoin", "Token", "Meme"]

  return (
    <div className="space-y-8">
      {categories.map((category) => {
        const categoryPositions = groupedPositions[category]
        if (categoryPositions.length === 0) return null

        return (
          <div key={category}>
            <div className="mb-4 flex items-center gap-2">
              <h3 className="text-lg font-semibold">{category}s</h3>
              <span className="text-sm text-muted-foreground">({categoryPositions.length})</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {categoryPositions.map((position) => (
                <PositionCard key={position.id} position={position} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
