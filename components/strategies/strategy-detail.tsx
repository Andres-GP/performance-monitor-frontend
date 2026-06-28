"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { HealthBadge, StatusBadge } from "@/components/shared/badges"
import { StatCard } from "@/components/shared/stat-card"
import { OfflineBanner } from "@/components/shared/offline-banner"
import { LazyMetricChart } from "@/components/charts/lazy"
import { useMetrics, useStrategy } from "@/lib/queries"
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format"
import { TradesTable } from "./trades-table"
import { EdgeHealthPanel } from "./edge-health-panel"

export function StrategyDetail({ id }: { id: string }) {
  const { strategy, isFallback, isLoading } = useStrategy(id)
  const metrics = useMetrics(id)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (!strategy) {
    return (
      <div className="flex flex-col items-start gap-4">
        <p className="text-muted-foreground">No se encontró la estrategia solicitada.</p>
        <Button variant="outline" render={<Link href="/strategies" />}>
          <ArrowLeft className="size-4" /> Volver a estrategias
        </Button>
      </div>
    )
  }

  const series = metrics.data?.data ?? []

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="w-fit -ml-2 text-muted-foreground"
          render={<Link href="/strategies" />}
        >
          <ArrowLeft className="size-4" /> Estrategias
        </Button>
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-2xl font-semibold">{strategy.name}</h2>
          <StatusBadge status={strategy.status} />
          <HealthBadge status={strategy.health_status} />
        </div>
        <p className="text-sm text-muted-foreground">
          {strategy.instrument} · {strategy.platform} · {strategy.trades_count} trades ·{" "}
          {formatCurrency(strategy.capital)} en capital
        </p>
      </div>

      {isFallback && <OfflineBanner />}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Win Rate" value={formatPercent(strategy.win_rate)} />
        <StatCard label="Profit Factor" value={formatNumber(strategy.profit_factor)} />
        <StatCard
          label="Drawdown"
          value={formatPercent(strategy.drawdown)}
          tone={strategy.drawdown <= -0.15 ? "negative" : "default"}
        />
        <StatCard label="Sharpe" value={formatNumber(strategy.sharpe)} />
      </div>

      <Tabs defaultValue="performance">
        <TabsList>
          <TabsTrigger value="performance">Rendimiento</TabsTrigger>
          <TabsTrigger value="trades">Operaciones</TabsTrigger>
          <TabsTrigger value="health">Edge Health</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Métricas en el tiempo</CardTitle>
            </CardHeader>
            <CardContent>
              <LazyMetricChart data={series} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trades" className="mt-4">
          <TradesTable strategyId={id} />
        </TabsContent>

        <TabsContent value="health" className="mt-4">
          <EdgeHealthPanel strategy={strategy} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
