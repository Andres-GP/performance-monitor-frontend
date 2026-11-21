"use client"

import { memo } from "react"
import { WifiOff } from "lucide-react"
import { useI18n } from "@/lib/i18n/context"

export const OfflineBanner = memo(function OfflineBanner({ show = true }: { show?: boolean }) {
  const { dict } = useI18n()
  if (!show) return null
  return (
    <div role="status" aria-live="polite" className="flex items-center gap-3 rounded-xl border border-chart-4/20 bg-chart-4/[0.055] px-4 py-3 text-sm text-chart-4 shadow-[inset_0_1px_rgba(255,255,255,0.02)]">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-chart-4/15 bg-chart-4/[0.08]">
        <WifiOff className="size-4" />
      </span>
      <span className="min-w-0 leading-relaxed">{dict.offline.message}</span>
    </div>
  )
})
