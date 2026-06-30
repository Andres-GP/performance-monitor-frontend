"use client";

import {
  Activity,
  ArrowUpDown,
  Gauge,
  Layers,
  Signal,
  TrendingUp,
  Waves,
} from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { OfflineBanner } from "@/components/shared/offline-banner";
import { RegimeWidget } from "./regime-widget";
import { useMarketRegime } from "@/lib/queries";
import { formatDate, formatNumber, formatPercent } from "@/lib/format";
import { useI18n } from "@/lib/i18n/context";

export function MarketRegimeView() {
  const { dict } = useI18n();
  const { data, isLoading } = useMarketRegime();
  const r = data?.data;

  // Función auxiliar para reemplazar {value} en las traducciones
  const interpolate = (template: string, value: string | number) =>
    template.replace("{value}", String(value));

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold">{dict.regime.title}</h2>
          <p className="text-sm text-muted-foreground">
            {dict.regime.subtitle}
          </p>
        </div>
        {r?.timestamp && (
          <span className="text-xs text-muted-foreground">
            {interpolate(dict.regime.updated, formatDate(r.timestamp))}
          </span>
        )}
      </div>

      {data?.isFallback && <OfflineBanner />}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={dict.regime.adx}
          value={formatNumber(r?.adx, 1)}
          icon={Gauge}
          hint={
            r?.trend
              ? interpolate(dict.regime.trend, r.trend)
              : dict.regime.trendStrength
          }
          loading={isLoading}
        />
        <StatCard
          label={dict.regime.vixPercentile}
          value={formatPercent(r?.vix_percentile)}
          icon={Activity}
          hint={
            r?.fear
              ? interpolate(dict.regime.fear, r.fear)
              : dict.regime.impliedVol
          }
          loading={isLoading}
        />
        <StatCard
          label={dict.regime.atrPercentile}
          value={formatPercent(r?.atr_percentile)}
          icon={Waves}
          hint={
            r?.volatility
              ? interpolate(dict.regime.volatility, r.volatility)
              : dict.regime.averageRange
          }
          loading={isLoading}
        />
        <StatCard
          label={dict.regime.breadth}
          value={formatPercent(r?.breadth)}
          icon={Layers}
          hint={dict.regime.breadthHint}
          loading={isLoading}
        />
        <StatCard
          label={dict.regime.strength}
          value={formatPercent(r?.strength)}
          icon={Signal}
          hint={dict.regime.strengthHint}
          loading={isLoading}
        />
        <StatCard
          label={dict.regime.advanceDecline}
          value={formatNumber(r?.advance_decline_ratio)}
          icon={ArrowUpDown}
          hint={dict.regime.advanceDeclineHint}
          loading={isLoading}
        />
        <StatCard
          label={dict.regime.newHighsLows}
          value={formatNumber(r?.nh_nl_ratio)}
          icon={TrendingUp}
          hint={dict.regime.newHighsLowsHint}
          loading={isLoading}
        />
        <StatCard
          label={dict.regime.corrSpyQqq}
          value={formatNumber(r?.correlation_spy_qqq)}
          icon={Activity}
          hint={interpolate(
            dict.regime.corrSpyTlt,
            formatNumber(r?.correlation_spy_tlt),
          )}
          loading={isLoading}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <RegimeWidget
          title={dict.regime.widgetCorrTitle}
          description={dict.regime.widgetCorrDesc}
          defaultSymbols="AMEX:SPY, NASDAQ:QQQ, NASDAQ:TLT"
        />
        <RegimeWidget
          title={dict.regime.widgetVixTitle}
          description={dict.regime.widgetVixDesc}
          defaultSymbols="TVC:VIX"
        />
      </div>

      <RegimeWidget
        title={dict.regime.widgetNhnlTitle}
        description={dict.regime.widgetNhnlDesc}
        defaultSymbols="AMEX:SPY, USI:MAHN, USI:MALN"
        height={420}
      />
    </div>
  );
}
