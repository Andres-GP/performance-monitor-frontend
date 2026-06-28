"use client"

import { Activity, ArrowDownRight, Gauge, Sigma, TrendingDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { HealthBadge } from "@/components/shared/badges"
import { useTrades } from "@/lib/queries"
import { formatNumber, formatPercent } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Strategy } from "@/types"

function mean(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((a, b) => a + b, 0) / values.length
}

function moment(values: number[], order: number, m: number, sd: number): number {
  if (values.length === 0 || sd === 0) return 0
  return mean(values.map((v) => ((v - m) / sd) ** order))
}

export function EdgeHealthPanel({ strategy }: { strategy: Strategy }) {
  const { data, isLoading } = useTrades(strategy.id)
  const trades = data?.data ?? []

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
    )
  }

  const pnls = trades.map((t) => t.pnl)
  const m = mean(pnls)
  const sd = Math.sqrt(moment(pnls, 2, m, 1)) // raw variance sqrt
  const skewness = moment(pnls, 3, m, sd || 1)
  const kurtosis = moment(pnls, 4, m, sd || 1) - 3

  // Out-of-sample degradation: win rate of the most recent third vs overall.
  const wins = (arr: typeof trades) => (arr.length ? arr.filter((t) => t.pnl > 0).length / arr.length : 0)
  const recent = trades.slice(0, Math.max(1, Math.floor(trades.length / 3)))
  const overallWin = wins(trades)
  const recentWin = wins(recent)
  const oosDegradation = overallWin ? (overallWin - recentWin) / overallWin : 0

  // Efficiency ratio: net pnl vs sum of absolute pnl (signal vs noise).
  const grossAbs = pnls.reduce((a, b) => a + Math.abs(b), 0)
  const netPnl = pnls.reduce((a, b) => a + b, 0)
  const efficiencyRatio = grossAbs ? netPnl / grossAbs : 0

  const metrics = [
    {
      label: "Degradación OOS",
      value: formatPercent(oosDegradation),
      icon: ArrowDownRight,
      negative: oosDegradation > 0.1,
      hint: "Caída del win rate reciente vs histórico",
    },
    {
      label: "Ratio de Eficiencia",
      value: formatNumber(efficiencyRatio),
      icon: Gauge,
      negative: efficiencyRatio < 0.05,
      hint: "Señal neta sobre ruido total",
    },
    {
      label: "Skewness",
      value: formatNumber(skewness),
      icon: Sigma,
      negative: skewness < -0.5,
      hint: "Asimetría de la distribución de PnL",
    },
    {
      label: "Kurtosis (exceso)",
      value: formatNumber(kurtosis),
      icon: Activity,
      negative: kurtosis > 3,
      hint: "Riesgo de colas / eventos extremos",
    },
    {
      label: "Profit Factor",
      value: formatNumber(strategy.profit_factor),
      icon: TrendingDown,
      negative: strategy.profit_factor < 1.1,
      hint: "Ganancia bruta / pérdida bruta",
    },
    {
      label: "Tamaño de Muestra",
      value: String(trades.length),
      icon: Sigma,
      negative: trades.length < 30,
      hint: "Operaciones analizadas",
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">Estado del Edge</CardTitle>
          <HealthBadge status={strategy.health_status} />
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {strategy.health_status === "healthy" &&
            "La estrategia mantiene su ventaja estadística dentro de los parámetros esperados."}
          {strategy.health_status === "edge_decay" &&
            "Se detecta deterioro del edge: el rendimiento reciente diverge del histórico. Considera revisar parámetros."}
          {strategy.health_status === "unhealthy" &&
            "La ventaja estadística se ha degradado significativamente. Se recomienda detener y reevaluar la estrategia."}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <Card key={metric.label}>
              <CardContent className="flex items-start justify-between gap-3 p-5">
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="text-sm text-muted-foreground">{metric.label}</span>
                  <span
                    className={cn(
                      "text-2xl font-semibold tabular-nums",
                      metric.negative ? "text-destructive" : "text-foreground",
                    )}
                  >
                    {metric.value}
                  </span>
                  <span className="text-xs text-muted-foreground">{metric.hint}</span>
                </div>
                <span
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-lg",
                    metric.negative ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary",
                  )}
                >
                  <Icon className="size-5" />
                </span>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
