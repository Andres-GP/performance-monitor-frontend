"use client";

import {
  Activity,
  ArrowDownRight,
  Gauge,
  Sigma,
  TrendingDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { HealthBadge } from "@/components/shared/badges";
import { useTrades } from "@/lib/queries";
import { formatNumber, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Strategy } from "@/types";
import { useI18n } from "@/lib/i18n/context";

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function moment(
  values: number[],
  order: number,
  m: number,
  sd: number,
): number {
  if (values.length === 0 || sd === 0) return 0;
  return mean(values.map((v) => ((v - m) / sd) ** order));
}

export function EdgeHealthPanel({ strategy }: { strategy: Strategy }) {
  const { data, isLoading } = useTrades(strategy.strategy_id);
  const trades = data?.data?.items ?? [];
  const { dict } = useI18n();

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
    );
  }

  const pnls = trades
    .map((trade) => trade.pnl ?? trade.profit)
    .filter((pnl): pnl is number => typeof pnl === "number");
  const sampleCount = data?.data?.total ?? trades.length;
  const m = mean(pnls);
  const sd = Math.sqrt(moment(pnls, 2, m, 1)); // raw variance sqrt
  const skewness = moment(pnls, 3, m, sd || 1);
  const kurtosis = moment(pnls, 4, m, sd || 1) - 3;

  const wins = (arr: typeof trades): number | null => {
    const values = arr.map((trade) => trade.pnl ?? trade.profit).filter((pnl): pnl is number => typeof pnl === "number");
    return values.length ? values.filter((pnl) => pnl > 0).length / values.length : null;
  };
  const recent = trades.slice(0, Math.max(1, Math.floor(trades.length / 3)));
  const overallWin = wins(trades);
  const recentWin = wins(recent);
  const oosDegradation = overallWin != null && recentWin != null && overallWin > 0
    ? (overallWin - recentWin) / overallWin
    : null;

  const grossAbs = pnls.reduce((a, b) => a + Math.abs(b), 0);
  const netPnl = pnls.reduce((a, b) => a + b, 0);
  const efficiencyRatio = pnls.length && grossAbs ? netPnl / grossAbs : null;

  const metrics = [
    {
      label: dict.edgeHealth.oosDegradation,
      value: formatPercent(oosDegradation),
      icon: ArrowDownRight,
      negative: oosDegradation != null && oosDegradation > 0.1,
      hint: dict.edgeHealth.oosHint,
    },
    {
      label: dict.edgeHealth.efficiencyRatio,
      value: formatNumber(efficiencyRatio),
      icon: Gauge,
      negative: efficiencyRatio != null && efficiencyRatio < 0.05,
      hint: dict.edgeHealth.efficiencyHint,
    },
    {
      label: dict.edgeHealth.skewness,
      value: formatNumber(pnls.length ? skewness : null),
      icon: Sigma,
      negative: pnls.length > 0 && skewness < -0.5,
      hint: dict.edgeHealth.skewnessHint,
    },
    {
      label: dict.edgeHealth.kurtosis,
      value: formatNumber(pnls.length ? kurtosis : null),
      icon: Activity,
      negative: pnls.length > 0 && kurtosis > 3,
      hint: dict.edgeHealth.kurtosisHint,
    },
    {
      label: dict.edgeHealth.profitFactor,
      value: formatNumber(strategy.metrics?.profit_factor),
      icon: TrendingDown,
      negative: typeof strategy.metrics?.profit_factor === "number" && strategy.metrics.profit_factor < 1.1,
      hint: dict.edgeHealth.profitFactorHint,
    },
    {
      label: dict.edgeHealth.sampleSize,
      value: String(sampleCount),
      icon: Sigma,
      negative: sampleCount < 30,
      hint: dict.edgeHealth.sampleSizeHint,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">Estado del Edge</CardTitle>
          <HealthBadge status={strategy.health_status} />
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {strategy.health_status === "healthy" &&
            dict.strategyDetail.edgeHealthHealthyDesc}
          {strategy.health_status === "edge_decay" &&
            dict.strategyDetail.edgeHealthDecayDesc}
          {strategy.health_status === "unhealthy" &&
            dict.strategyDetail.edgeUnhealthyDesc}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label}>
              <CardContent className="flex items-start justify-between gap-3 p-5">
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="text-sm text-muted-foreground">
                    {metric.label}
                  </span>
                  <span
                    className={cn(
                      "text-2xl font-semibold tabular-nums",
                      metric.negative ? "text-destructive" : "text-foreground",
                    )}
                  >
                    {metric.value}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {metric.hint}
                  </span>
                </div>
                <span
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-lg",
                    metric.negative
                      ? "bg-destructive/10 text-destructive"
                      : "bg-primary/10 text-primary",
                  )}
                >
                  <Icon className="size-5" />
                </span>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
