"use client"

import { Activity, Gauge, Waves } from "lucide-react"
import { StatCard } from "@/components/shared/stat-card"
import { formatNumber, formatPercent } from "@/lib/format"
import { useI18n } from "@/lib/i18n/context"
import { useMarketRegime } from "@/lib/queries"

export function RegimeCards() {
  const { dict, t } = useI18n()
  const { data, isLoading } = useMarketRegime()
  const r = data?.data

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard
        label={dict.regime.adx}
        value={formatNumber(r?.adx, 1)}
        icon={Gauge}
        hint={r?.trend ? t(dict.regime.trend, { value: r.trend }) : dict.regime.trendStrength}
        loading={isLoading}
      />
      <StatCard
        label={dict.regime.vixPercentile}
        value={formatPercent(r?.vix_percentile)}
        icon={Activity}
        hint={r?.fear ? t(dict.regime.fear, { value: r.fear }) : dict.regime.impliedVol}
        loading={isLoading}
      />
      <StatCard
        label={dict.regime.atrPercentile}
        value={formatPercent(r?.atr_percentile)}
        icon={Waves}
        hint={r?.volatility ? t(dict.regime.volatility, { value: r.volatility }) : dict.regime.averageRange}
        loading={isLoading}
      />
    </div>
  )
}
