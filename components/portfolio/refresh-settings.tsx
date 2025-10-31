"use client"

/**
 * Refresh Settings Component
 * Allows users to configure auto-refresh interval
 */

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Settings } from "lucide-react"

interface RefreshSettingsProps {
  currentInterval: number
  onIntervalChange: (interval: number) => void
}

const REFRESH_OPTIONS = [
  { label: "10 seconds", value: 10000 },
  { label: "30 seconds", value: 30000 },
  { label: "1 minute", value: 60000 },
  { label: "5 minutes", value: 300000 },
  { label: "Disabled", value: 0 },
]

export function RefreshSettings({ currentInterval, onIntervalChange }: RefreshSettingsProps) {
  const [open, setOpen] = useState(false)

  const currentOption = REFRESH_OPTIONS.find((opt) => opt.value === currentInterval)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="mr-2 h-4 w-4" />
          Auto-refresh: {currentOption?.label || "Custom"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Refresh Interval</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={currentInterval.toString()}
          onValueChange={(value) => {
            onIntervalChange(Number.parseInt(value))
            setOpen(false)
          }}
        >
          {REFRESH_OPTIONS.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value.toString()}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
