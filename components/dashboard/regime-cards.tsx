"use client"

import { Activity, Gauge, Waves } from "lucide-react"
import { StatCard } from "@/components/shared/stat-card"
import { formatNumber, formatPercent } from "@/lib/format"
import { useMarketRegime } from "@/lib/queries"

export function RegimeCards() {
  const { data, isLoading } = useMarketRegime()
  const r = data?.data

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard
        label="ADX"
        value={formatNumber(r?.adx, 1)}
        icon={Gauge}
        hint={r?.trend ? `Tendencia: ${r.trend}` : "Fuerza de tendencia"}
        loading={isLoading}
      />
      <StatCard
        label="VIX (percentil)"
        value={formatPercent(r?.vix_percentile)}
        icon={Activity}
        hint={r?.fear ? `Miedo: ${r.fear}` : "Volatilidad implícita"}
        loading={isLoading}
      />
      <StatCard
        label="ATR (percentil)"
        value={formatPercent(r?.atr_percentile)}
        icon={Waves}
        hint={r?.volatility ? `Volatilidad: ${r.volatility}` : "Rango medio"}
        loading={isLoading}
      />
    </div>
  )
}
