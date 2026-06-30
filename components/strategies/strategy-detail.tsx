"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Gauge, Percent, Trash2, TrendingDown, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { HealthBadge, StatusBadge } from "@/components/shared/badges"
import { StatCard } from "@/components/shared/stat-card"
import { OfflineBanner } from "@/components/shared/offline-banner"
import { EquityChart, MetricChart } from "@/components/charts/lazy"
import { useDeleteStrategy, useMetrics, useStrategy } from "@/lib/queries"
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format"
import { TradesTable } from "./trades-table"
import { EdgeHealthPanel } from "./edge-health-panel"
import { BacktestPanel } from "./backtest-panel"
import { DeleteStrategyDialog } from "./delete-strategy-dialog"

export function StrategyDetail({ id }: { id: string }) {
  const router = useRouter()
  const { strategy, isFallback, isLoading } = useStrategy(id)
  const metrics = useMetrics(id)
  const deleteStrategy = useDeleteStrategy()
  const [confirmDelete, setConfirmDelete] = useState(false)

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
        <Button variant="outline" nativeButton={false} render={<Link href="/strategies" />}>
          <ArrowLeft className="size-4" /> Volver a estrategias
        </Button>
      </div>
    )
  }

  const series = metrics.data?.data ?? []
  const canDelete = strategy.status === "Stopped"

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 w-fit text-muted-foreground"
          nativeButton={false}
          render={<Link href="/strategies" />}
        >
          <ArrowLeft className="size-4" /> Estrategias
        </Button>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-semibold">{strategy.name}</h2>
            <StatusBadge status={strategy.status} />
            <HealthBadge status={strategy.health_status} />
          </div>
          <Button
            variant="destructive"
            size="sm"
            disabled={!canDelete}
            onClick={() => setConfirmDelete(true)}
            title={canDelete ? undefined : "Solo se pueden eliminar estrategias detenidas"}
          >
            <Trash2 className="size-4" /> Eliminar
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          {strategy.instrument} · {strategy.platform} · {strategy.trades_count} trades ·{" "}
          {formatCurrency(strategy.capital)} en capital
        </p>
      </div>

      {isFallback && <OfflineBanner />}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Win Rate" value={formatPercent(strategy.win_rate)} icon={Percent} />
        <StatCard
          label="Profit Factor"
          value={formatNumber(strategy.profit_factor)}
          icon={TrendingUp}
        />
        <StatCard
          label="Drawdown"
          value={formatPercent(strategy.drawdown)}
          icon={TrendingDown}
          hint={strategy.drawdown >= 0.15 ? "Por encima del umbral" : "Dentro de rango"}
          trend={strategy.drawdown >= 0.15 ? "down" : "neutral"}
        />
        <StatCard label="Sharpe" value={formatNumber(strategy.sharpe)} icon={Gauge} />
      </div>

      <Tabs defaultValue="metrics">
        <TabsList>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
          <TabsTrigger value="trades">Operaciones</TabsTrigger>
          <TabsTrigger value="health">Edge Health</TabsTrigger>
          <TabsTrigger value="backtest">Backtest</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="mt-4 flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Curva de Equity</CardTitle>
            </CardHeader>
            <CardContent>
              <EquityChart data={series} />
            </CardContent>
          </Card>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Win Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <MetricChart data={series} dataKey="win_rate" label="Win Rate" asPercent />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Profit Factor</CardTitle>
              </CardHeader>
              <CardContent>
                <MetricChart data={series} dataKey="profit_factor" label="Profit Factor" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Drawdown</CardTitle>
              </CardHeader>
              <CardContent>
                <MetricChart data={series} dataKey="drawdown" label="Drawdown" asPercent />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sharpe</CardTitle>
              </CardHeader>
              <CardContent>
                <MetricChart data={series} dataKey="sharpe" label="Sharpe" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trades" className="mt-4">
          <TradesTable strategyId={id} />
        </TabsContent>

        <TabsContent value="health" className="mt-4">
          <EdgeHealthPanel strategy={strategy} />
        </TabsContent>

        <TabsContent value="backtest" className="mt-4">
          <BacktestPanel strategyId={id} />
        </TabsContent>
      </Tabs>

      <DeleteStrategyDialog
        strategy={confirmDelete ? strategy : null}
        onOpenChange={(open) => !open && setConfirmDelete(false)}
        onConfirm={() => {
          deleteStrategy.mutate(strategy.id, { onSuccess: () => router.push("/strategies") })
          setConfirmDelete(false)
        }}
        isPending={deleteStrategy.isPending}
      />
    </div>
  )
}
