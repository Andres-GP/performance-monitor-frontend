"use client"

import {
  Activity,
  ArrowUpDown,
  Gauge,
  Layers,
  Signal,
  TrendingUp,
  Waves,
} from "lucide-react"
import { StatCard } from "@/components/shared/stat-card"
import { OfflineBanner } from "@/components/shared/offline-banner"
import { RegimeWidget } from "./regime-widget"
import { useMarketRegime } from "@/lib/queries"
import { formatDate, formatNumber, formatPercent } from "@/lib/format"

export function MarketRegimeView() {
  const { data, isLoading } = useMarketRegime()
  const r = data?.data

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold">Régimen de Mercado</h2>
          <p className="text-sm text-muted-foreground">
            Indicadores macro de tendencia, volatilidad y amplitud del mercado
          </p>
        </div>
        {r?.timestamp && (
          <span className="text-xs text-muted-foreground">
            Actualizado {formatDate(r.timestamp)}
          </span>
        )}
      </div>

      {data?.isFallback && <OfflineBanner />}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
        <StatCard
          label="Breadth"
          value={formatPercent(r?.breadth)}
          icon={Layers}
          hint="Amplitud del mercado"
          loading={isLoading}
        />
        <StatCard
          label="Strength"
          value={formatPercent(r?.strength)}
          icon={Signal}
          hint="Fortaleza relativa"
          loading={isLoading}
        />
        <StatCard
          label="Advance / Decline"
          value={formatNumber(r?.advance_decline_ratio)}
          icon={ArrowUpDown}
          hint="Ratio avances/retrocesos"
          loading={isLoading}
        />
        <StatCard
          label="New Highs / Lows"
          value={formatNumber(r?.nh_nl_ratio)}
          icon={TrendingUp}
          hint="Ratio máximos/mínimos"
          loading={isLoading}
        />
        <StatCard
          label="Corr. SPY/QQQ"
          value={formatNumber(r?.correlation_spy_qqq)}
          icon={Activity}
          hint={`SPY/TLT: ${formatNumber(r?.correlation_spy_tlt)}`}
          loading={isLoading}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <RegimeWidget
          title="Correlaciones Clave"
          description="Evolución comparada de SPY, QQQ y TLT"
          defaultSymbols="AMEX:SPY, NASDAQ:QQQ, NASDAQ:TLT"
        />
        <RegimeWidget
          title="Volatilidad (VIX)"
          description="Índice de volatilidad implícita del S&P 500"
          defaultSymbols="TVC:VIX"
        />
      </div>

      <RegimeWidget
        title="New Highs / New Lows"
        description="Amplitud del mercado mediante nuevos máximos y mínimos"
        defaultSymbols="AMEX:SPY, USI:MAHN, USI:MALN"
        height={420}
      />
    </div>
  )
}
