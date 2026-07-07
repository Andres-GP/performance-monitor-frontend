"use client"

import { memo } from "react"
import { WifiOff } from "lucide-react"
import { useI18n } from "@/lib/i18n/context"

export const OfflineBanner = memo(function OfflineBanner({ show = true }: { show?: boolean }) {
  const { dict } = useI18n()
  if (!show) return null
  return (
    <div className="flex items-center gap-2 rounded-md border border-chart-4/30 bg-chart-4/10 px-3 py-2 text-sm text-chart-4">
      <WifiOff className="size-4 shrink-0" />
      <span>{dict.offline.message}</span>
    </div>
  )
})
