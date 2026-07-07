"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Gauge,
  Percent,
  Trash2,
  TrendingDown,
  TrendingUp,
  Upload,
  Calendar,
  DollarSign,
  BarChart3,
  Sliders,
  GitCompare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HealthBadge, StatusBadge } from "@/components/shared/badges";
import { StatCard } from "@/components/shared/stat-card";
import { OfflineBanner } from "@/components/shared/offline-banner";
import { EquityChart, MetricChart } from "@/components/charts/lazy";
import {
  useDeleteStrategy,
  useMetrics,
  useStrategy,
  useUploadBacktest,
} from "@/lib/queries";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import { useI18n } from "@/lib/i18n/context";
import { TradesTable } from "./trades-table";
import { EdgeHealthPanel } from "./edge-health-panel";
import { BacktestPanel } from "./backtest-panel";
import { DeleteStrategyDialog } from "./delete-strategy-dialog";
import { toast } from "sonner";

function BacktestUpload({ strategyId }: { strategyId: string }) {
  const { dict } = useI18n();
  const uploadBacktest = useUploadBacktest(strategyId);

  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [expectedPnl, setExpectedPnl] = useState<number | "">("");
  const [expectedSharpe, setExpectedSharpe] = useState<number | "">("");
  const [expectedDrawdown, setExpectedDrawdown] = useState<number | "">("");
  const [parameters, setParameters] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !periodStart ||
      !periodEnd ||
      expectedPnl === "" ||
      expectedSharpe === "" ||
      expectedDrawdown === ""
    ) {
      toast.error("Por favor, completa todos los campos obligatorios");
      return;
    }

    let parsedParams = {};
    if (parameters.trim()) {
      try {
        parsedParams = JSON.parse(parameters);
      } catch {
        toast.error("Los parámetros deben ser un JSON válido");
        return;
      }
    }

    uploadBacktest.mutate({
      expected_pnl: Number(expectedPnl),
      expected_sharpe: Number(expectedSharpe),
      expected_drawdown: Number(expectedDrawdown),
      period_start: periodStart,
      period_end: periodEnd,
      parameters: parsedParams,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Upload className="size-4" />
          {dict.strategyDetail.uploadBacktest || dict.backtest.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label
                htmlFor="period_start"
                className="text-xs font-medium text-muted-foreground"
              >
                <Calendar className="inline size-3 mr-1" />
                {dict.backtest.startOfPeriod}
              </Label>
              <Input
                id="period_start"
                type="date"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
                required
                className="bg-background/50"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="period_end"
                className="text-xs font-medium text-muted-foreground"
              >
                <Calendar className="inline size-3 mr-1" />
                {dict.backtest.endOfPeriod}
              </Label>
              <Input
                id="period_end"
                type="date"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
                required
                className="bg-background/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label
                htmlFor="expected_pnl"
                className="text-xs font-medium text-muted-foreground"
              >
                <DollarSign className="inline size-3 mr-1" />
                {dict.backtest.expectedPnl}
              </Label>
              <Input
                id="expected_pnl"
                type="number"
                step="0.01"
                placeholder="15000"
                value={expectedPnl}
                onChange={(e) =>
                  setExpectedPnl(e.target.value ? Number(e.target.value) : "")
                }
                required
                className="bg-background/50"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="expected_sharpe"
                className="text-xs font-medium text-muted-foreground"
              >
                <BarChart3 className="inline size-3 mr-1" />
                {dict.backtest.expectedSharpe}
              </Label>
              <Input
                id="expected_sharpe"
                type="number"
                step="0.01"
                placeholder="1.8"
                value={expectedSharpe}
                onChange={(e) =>
                  setExpectedSharpe(
                    e.target.value ? Number(e.target.value) : "",
                  )
                }
                required
                className="bg-background/50"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="expected_drawdown"
                className="text-xs font-medium text-muted-foreground"
              >
                <TrendingDown className="inline size-3 mr-1" />
                {dict.backtest.expectedDrowdown}
              </Label>
              <Input
                id="expected_drawdown"
                type="number"
                step="0.1"
                placeholder="8"
                value={expectedDrawdown}
                onChange={(e) =>
                  setExpectedDrawdown(
                    e.target.value ? Number(e.target.value) : "",
                  )
                }
                required
                className="bg-background/50"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="parameters"
              className="text-xs font-medium text-muted-foreground"
            >
              <Sliders className="inline size-3 mr-1" />
              {dict.backtest.parametersOptionalJSON}
            </Label>
            <textarea
              id="parameters"
              placeholder='{"fast": 10, "slow": 25}'
              value={parameters}
              onChange={(e) => setParameters(e.target.value)}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
            />
            <p className="text-[10px] text-muted-foreground">
              {dict.backtest.JSONParametersValidDesc}
            </p>
          </div>

          <Button
            type="submit"
            disabled={uploadBacktest.isPending}
            className="w-full sm:w-auto"
          >
            {uploadBacktest.isPending
              ? dict.backtest.submitting
              : dict.backtest.submit}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function StrategyDetail({ id }: { id: string }) {
  const router = useRouter();
  const { dict, t } = useI18n();
  const { strategy, isFallback, isLoading } = useStrategy(id);
  const metrics = useMetrics(id);
  const deleteStrategy = useDeleteStrategy();
  const [confirmDelete, setConfirmDelete] = useState(false);

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

  const metricsData = strategy.metrics || {};
  const winRateReal = metricsData.win_rate ?? 0;
  const profitFactorReal = metricsData.profit_factor ?? 0;
  const drawdownReal = metricsData.drawdown ?? 0;
  const sharpeReal = metricsData.sharpe ?? 0;

  const series = metrics.data?.data ?? [];

  const backtestData = strategy.backtest;
  const hasBacktest = backtestData !== null;

  const canDelete = strategy.state === "Stopped";

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
          <ArrowLeft className="size-4" /> {dict.strategyDetail.back}
        </Button>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-semibold">{strategy.name}</h2>
            <StatusBadge status={strategy.state} />
            <HealthBadge status={strategy.health_status} />
          </div>
          <Button
            variant="destructive"
            size="sm"
            disabled={!canDelete}
            onClick={() => setConfirmDelete(true)}
            title={
              canDelete
                ? undefined
                : dict.strategyDetail.onlyStoppedCanBeDeleted
            }
          >
            <Trash2 className="size-4" /> {dict.strategyDetail.delete}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          {t(dict.strategyDetail.subtitle, {
            instrument: strategy.instrument,
            platform: strategy.platform,
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
          hint={
            drawdownReal >= 0.15
              ? dict.strategyDetail.aboveThreshold
              : dict.strategyDetail.withinRange
          }
          trend={drawdownReal >= 0.15 ? "down" : "neutral"}
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
              {series.length > 0 ? (
                <EquityChart data={series} />
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
          <BacktestUpload strategyId={id} />
          {hasBacktest && <BacktestPanel strategyId={id} />}
          {!hasBacktest && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <BarChart3 className="size-12 mb-4 opacity-50" />
                <p className="text-sm">{dict.backtest.noData}</p>
                <p className="text-xs mt-1">{dict.backtest.useForm}</p>
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
              {!hasBacktest ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <BarChart3 className="size-12 mb-4 opacity-50" />
                  <p className="text-sm">{dict.backtest.noData}</p>
                  <p className="text-xs mt-1">{dict.backtest.useForm}</p>
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
                        <td className="py-2">{dict.backtest.winRate}</td>
                        <td className="text-right tabular-nums">
                          {formatPercent(backtestData.expected_win_rate ?? 0)}
                        </td>
                        <td className="text-right tabular-nums">
                          {formatPercent(winRateReal)}
                        </td>
                        <td
                          className={`text-right tabular-nums ${
                            backtestData.expected_win_rate
                              ? Math.abs(
                                  winRateReal -
                                    (backtestData.expected_win_rate ?? 0),
                                ) > 0.1
                                ? "text-destructive"
                                : "text-green-500"
                              : "text-muted-foreground"
                          }`}
                        >
                          {backtestData.expected_win_rate
                            ? formatPercent(
                                winRateReal -
                                  (backtestData.expected_win_rate ?? 0),
                              )
                            : "N/A"}
                        </td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2">Profit Factor</td>
                        <td className="text-right tabular-nums">
                          {formatNumber(
                            backtestData.expected_profit_factor ?? 0,
                          )}
                        </td>
                        <td className="text-right tabular-nums">
                          {formatNumber(profitFactorReal)}
                        </td>
                        <td
                          className={`text-right tabular-nums ${
                            backtestData.expected_profit_factor
                              ? Math.abs(
                                  profitFactorReal -
                                    (backtestData.expected_profit_factor ?? 0),
                                ) > 0.5
                                ? "text-destructive"
                                : "text-green-500"
                              : "text-muted-foreground"
                          }`}
                        >
                          {backtestData.expected_profit_factor
                            ? formatNumber(
                                profitFactorReal -
                                  (backtestData.expected_profit_factor ?? 0),
                              )
                            : "N/A"}
                        </td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2">Drawdown (%)</td>
                        <td className="text-right tabular-nums">
                          {formatPercent(
                            (backtestData.expected_drawdown ?? 0) / 100,
                          )}
                        </td>
                        <td className="text-right tabular-nums">
                          {formatPercent(drawdownReal)}
                        </td>
                        <td
                          className={`text-right tabular-nums ${
                            backtestData.expected_drawdown
                              ? Math.abs(
                                  drawdownReal -
                                    (backtestData.expected_drawdown ?? 0) / 100,
                                ) > 0.05
                                ? "text-destructive"
                                : "text-green-500"
                              : "text-muted-foreground"
                          }`}
                        >
                          {backtestData.expected_drawdown
                            ? formatPercent(
                                drawdownReal -
                                  (backtestData.expected_drawdown ?? 0) / 100,
                              )
                            : "N/A"}
                        </td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2">Sharpe</td>
                        <td className="text-right tabular-nums">
                          {formatNumber(backtestData.expected_sharpe ?? 0)}
                        </td>
                        <td className="text-right tabular-nums">
                          {formatNumber(sharpeReal)}
                        </td>
                        <td
                          className={`text-right tabular-nums ${
                            backtestData.expected_sharpe
                              ? Math.abs(
                                  sharpeReal -
                                    (backtestData.expected_sharpe ?? 0),
                                ) > 0.3
                                ? "text-destructive"
                                : "text-green-500"
                              : "text-muted-foreground"
                          }`}
                        >
                          {backtestData.expected_sharpe
                            ? formatNumber(
                                sharpeReal -
                                  (backtestData.expected_sharpe ?? 0),
                              )
                            : "N/A"}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2">{dict.backtest.expectedPnl}</td>
                        <td className="text-right tabular-nums">
                          {formatCurrency(backtestData.expected_pnl ?? 0)}
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
      <DeleteStrategyDialog
        strategy={confirmDelete ? strategy : null}
        onOpenChange={(open) => !open && setConfirmDelete(false)}
        onConfirm={() => {
          deleteStrategy.mutate(strategy.strategy_id, {
            onSuccess: () => router.push("/strategies"),
          });
          setConfirmDelete(false);
        }}
        isPending={deleteStrategy.isPending}
      />
    </div>
  );
}
