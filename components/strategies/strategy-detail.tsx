"use client";

import { MonitoringStrategyPanel } from "./monitoring-strategy-panel";
import Link from "next/link";
import {
  ArrowLeft,
  Gauge,
  Percent,
  TrendingDown,
  TrendingUp,
  BarChart3,
  GitCompare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { HealthBadge, StatusBadge } from "@/components/shared/badges";
import { StatCard } from "@/components/shared/stat-card";
import { OfflineBanner } from "@/components/shared/offline-banner";
import { EquityChart, MetricChart } from "@/components/charts/lazy";
import { useMetrics, useStrategy, useStrategyEquity } from "@/lib/queries";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import { useI18n } from "@/lib/i18n/context";
import { TradesTable } from "./trades-table";
import { EdgeHealthPanel } from "./edge-health-panel";
import { BacktestPanel } from "./backtest-panel";

export function StrategyDetail({ id }: { id: string }) {
  const { dict, t } = useI18n();
  const { strategy, isFallback, isLoading } = useStrategy(id);
  const metrics = useMetrics(id);
  const equity = useStrategyEquity(id);

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
    );
  }

  if (!strategy) {
    return (
      <div className="flex flex-col items-start gap-4">
        <p className="text-muted-foreground">{dict.strategyDetail.notFound}</p>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/strategies" />}
        >
          <ArrowLeft className="size-4" />{" "}
          {dict.strategyDetail.backToStrategies}
        </Button>
      </div>
    );
  }

  const metricsData = strategy.metrics;
  const winRateReal = metricsData?.win_rate;
  const profitFactorReal = metricsData?.profit_factor;
  const drawdownReal = metricsData?.drawdown;
  const sharpeReal = metricsData?.sharpe;

  const metricsSeries = metrics.data?.data ?? [];
  const equitySamples = equity.data?.data?.items ?? [];
  const equitySeries = equitySamples.length > 0
    ? [...equitySamples].reverse().map((sample) => ({ timestamp: sample.ts, equity: sample.equity }))
    : metricsSeries;
  const series = metricsSeries;

  const backtestData = strategy.backtest ?? null;
  const hasBacktest = backtestData !== null;


  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <MonitoringStrategyPanel strategyId={id} />
      <div className="flex flex-col gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 w-fit text-muted-foreground"
          nativeButton={false}
          render={<Link href="/strategies" />}
        >
          <ArrowLeft className="size-4" /> {dict.strategyDetail.back}
        </Button>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-semibold">{strategy.name}</h2>
            <StatusBadge status={strategy.state} />
            <HealthBadge status={strategy.health_status} />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {t(dict.strategyDetail.subtitle, {
            instrument: strategy.instrument,
            platform: strategy.platform ?? dict.common.none,
            trades: strategy.trades_count ?? 0,
          })}
        </p>
      </div>
      {isFallback && <OfflineBanner />}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={dict.strategyDetail.winRate}
          value={formatPercent(winRateReal)}
          icon={Percent}
        />
        <StatCard
          label={dict.strategyDetail.profitFactor}
          value={formatNumber(profitFactorReal)}
          icon={TrendingUp}
        />
        <StatCard
          label={dict.strategyDetail.drawdown}
          value={formatPercent(drawdownReal)}
          icon={TrendingDown}
          hint={drawdownReal == null ? undefined : drawdownReal >= 0.15
            ? dict.strategyDetail.aboveThreshold
            : dict.strategyDetail.withinRange}
          trend={drawdownReal == null ? "neutral" : drawdownReal >= 0.15 ? "down" : "neutral"}
        />
        <StatCard
          label={dict.strategyDetail.sharpe}
          value={formatNumber(sharpeReal)}
          icon={Gauge}
        />
      </div>
      <Tabs defaultValue="metrics">
        <TabsList>
          <TabsTrigger value="metrics">
            {dict.strategyDetail.tabMetrics}
          </TabsTrigger>
          <TabsTrigger value="trades">
            {dict.strategyDetail.tabTrades}
          </TabsTrigger>
          <TabsTrigger value="health">
            {dict.strategyDetail.tabHealth}
          </TabsTrigger>
          <TabsTrigger value="backtest">
            {dict.strategyDetail.tabBacktest}
          </TabsTrigger>
          <TabsTrigger value="comparison">
            {dict.strategyDetail.comparison}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="mt-4 flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {dict.strategyDetail.equityCurve}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {equitySeries.length > 0 ? (
                <EquityChart data={equitySeries} />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <TrendingUp className="size-12 mb-4 opacity-50" />
                  <p className="text-sm">
                    {dict.strategyDetail.equityCurveNoData}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {series.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {dict.strategyDetail.winRate}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <MetricChart
                    data={series}
                    dataKey="win_rate"
                    label={dict.strategyDetail.winRate}
                    asPercent
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {dict.strategyDetail.profitFactor}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <MetricChart
                    data={series}
                    dataKey="profit_factor"
                    label={dict.strategyDetail.profitFactor}
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {dict.strategyDetail.drawdown}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <MetricChart
                    data={series}
                    dataKey="drawdown"
                    label={dict.strategyDetail.drawdown}
                    asPercent
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {dict.strategyDetail.sharpe}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <MetricChart
                    data={series}
                    dataKey="sharpe"
                    label={dict.strategyDetail.sharpe}
                  />
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <BarChart3 className="size-12 mb-4 opacity-50" />
                <p className="text-sm">{dict.strategyDetail.noMetrics}</p>
                <p className="text-xs mt-1">{dict.strategyDetail.noOpsYet}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="trades" className="mt-4">
          <TradesTable strategyId={id} />
        </TabsContent>

        <TabsContent value="health" className="mt-4">
          <EdgeHealthPanel strategy={strategy} />
        </TabsContent>

        <TabsContent value="backtest" className="mt-4 space-y-4">
          {hasBacktest && <BacktestPanel strategyId={id} />}
          {!hasBacktest && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <BarChart3 className="size-12 mb-4 opacity-50" />
                <p className="text-sm">{dict.backtest.noData}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="comparison" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <GitCompare className="size-4" />
                {dict.backtest.backtestVsReal}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!backtestData ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <BarChart3 className="size-12 mb-4 opacity-50" />
                  <p className="text-sm">{dict.backtest.noData}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 font-medium text-muted-foreground">
                          {dict.backtest.metric}
                        </th>
                        <th className="text-right py-2 font-medium text-muted-foreground">
                          {dict.backtest.expectedBacktestParentheses}
                        </th>
                        <th className="text-right py-2 font-medium text-muted-foreground">
                          {dict.backtest.realLiveParantheses}
                        </th>
                        <th className="text-right py-2 font-medium text-muted-foreground">
                          {dict.backtest.difference}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border/50">
                        <td className="py-2">Drawdown (%)</td>
                        <td className="text-right tabular-nums">
                          {formatPercent(backtestData.expected_drawdown == null ? null : backtestData.expected_drawdown / 100)}
                        </td>
                        <td className="text-right tabular-nums">
                          {formatPercent(drawdownReal)}
                        </td>
                        <td
                          className={`text-right tabular-nums ${
                            backtestData.expected_drawdown != null && drawdownReal != null
                              ? Math.abs(
                                  drawdownReal - backtestData.expected_drawdown / 100,
                                ) > 0.05
                                ? "text-destructive"
                                : "text-green-500"
                              : "text-muted-foreground"
                          }`}
                        >
                          {backtestData.expected_drawdown != null && drawdownReal != null
                            ? formatPercent(drawdownReal - backtestData.expected_drawdown / 100)
                            : dict.common.none}
                        </td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2">Sharpe</td>
                        <td className="text-right tabular-nums">
                          {formatNumber(backtestData.expected_sharpe)}
                        </td>
                        <td className="text-right tabular-nums">
                          {formatNumber(sharpeReal)}
                        </td>
                        <td
                          className={`text-right tabular-nums ${
                            backtestData.expected_sharpe != null && sharpeReal != null
                              ? Math.abs(
                                  sharpeReal - backtestData.expected_sharpe,
                                ) > 0.3
                                ? "text-destructive"
                                : "text-green-500"
                              : "text-muted-foreground"
                          }`}
                        >
                          {backtestData.expected_sharpe != null && sharpeReal != null
                            ? formatNumber(sharpeReal - backtestData.expected_sharpe)
                            : dict.common.none}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2">{dict.backtest.expectedPnl}</td>
                        <td className="text-right tabular-nums">
                          {formatCurrency(backtestData.expected_pnl)}
                        </td>
                        <td className="text-right tabular-nums text-muted-foreground">
                          —
                        </td>
                        <td className="text-right tabular-nums text-muted-foreground">
                          —
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="mt-4 text-xs text-muted-foreground border-t border-border pt-4">
                    <p>
                      {dict.backtest.periodOfBacktest}{" "}
                      <span className="font-mono">
                        {backtestData.period_start} → {backtestData.period_end}
                      </span>
                    </p>
                    {backtestData.parameters &&
                      Object.keys(backtestData.parameters).length > 0 && (
                        <p className="mt-1">
                          {dict.backtest.parameters}{" "}
                          <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">
                            {JSON.stringify(backtestData.parameters)}
                          </code>
                        </p>
                      )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
