"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, HeartPulse, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { apiGet } from "@/lib/api-client";
import { useI18n } from "@/lib/i18n/context";
import { useApiToken, useCapitalSummary, useExecutionEvents, usePortfolioTrades } from "@/lib/queries";
import { formatDate, formatNumber, formatPercentPoints } from "@/lib/format";
import type { Trade } from "@/types";

interface PortfolioIndex {
  items: Array<{ id: string; name?: string }>;
  total: number;
}

interface PortfolioStrategy {
  id: string;
  name?: string;
  expected_mode?: "demo" | "live";
  current_mode?: "demo" | "live" | null;
  mode_status?: "unconfirmed" | "matches_expected" | "mode_mismatch";
  mode_observed_at?: string | null;
  last_heartbeat_at?: string | null;
  metrics?: {
    equity?: number | null;
    total_dd_pct?: number | null;
    rolling_20?: { n_trades?: number; win_rate?: number | null; profit_factor?: number | null; expectancy_pct?: number | null };
    current_loss_streak?: number;
    trade_count?: number;
  } | null;
  alerts?: Array<{
    id: number;
    severity?: string;
    status?: string;
    rule_key?: string;
  }>;
}

interface PortfolioDetail {
  portfolio: { id: string; name?: string };
  metrics: { equity?: number | null; total_dd_pct?: number | null } | null;
  strategies: PortfolioStrategy[];
  alerts: Array<{ id: number; status?: string }>;
  equity_curve: Array<{ ts: string; equity: number }>;
}

interface PortfolioCorrelation {
  items: Array<{
    strategy_a: string;
    strategy_b: string;
    correlation: number | null;
    observations?: number;
    window_days?: number;
    band?: string;
    last_evaluated_at?: string;
  }>;
}

const STALE_TIME = 60_000;

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{label}</CardTitle>
      </CardHeader>
      <CardContent className="break-words text-lg font-semibold leading-7 tabular-nums sm:text-xl">{value}</CardContent>
    </Card>
  );
}

function capitalByCurrency(data: import("@/types").CapitalSummary | null | undefined, locale: string) {
  const totals = new Map<string, number>();
  for (const group of Object.values(data?.by_type ?? {})) {
    for (const account of group.accounts ?? []) {
      if (!Number.isFinite(account.capital) || !account.currency) continue;
      totals.set(account.currency, (totals.get(account.currency) ?? 0) + account.capital);
    }
  }
  if (!totals.size) return "—";
  return [...totals.entries()].map(([currency, amount]) => {
    try {
      return new Intl.NumberFormat(locale === "es" ? "es-CO" : "en-US", {
        style: "currency", currency, maximumFractionDigits: 0,
      }).format(amount);
    } catch {
      return `${currency} ${formatNumber(amount, 0)}`;
    }
  }).join(" · ");
}

export function MonitoringPortfolioDashboard() {
  const getToken = useApiToken();
  const { dict, locale, t } = useI18n();
  const copy = dict.portfolio;
  const [selectedId, setSelectedId] = useState<string>();
  const [tradePage, setTradePage] = useState(0);
  const [executionStrategy, setExecutionStrategy] = useState("");
  const [executionPage, setExecutionPage] = useState(0);
  const capital = useCapitalSummary();

  const portfolios = useQuery({
    queryKey: ["monitoring-portfolios"],
    queryFn: async ({ signal }) =>
      apiGet<PortfolioIndex>("/portfolios?limit=100", {
        signal,
        token: await getToken(),
      }),
    staleTime: STALE_TIME,
  });

  const portfolioId =
    selectedId ?? portfolios.data?.items[0]?.id ?? undefined;
  const detail = useQuery({
    queryKey: ["monitoring-portfolio", portfolioId],
    enabled: !!portfolioId,
    queryFn: async ({ signal }) =>
      apiGet<PortfolioDetail>(`/portfolios/${portfolioId}`, {
        signal,
        token: await getToken(),
      }),
    staleTime: STALE_TIME,
  });
  const correlation = useQuery({
    queryKey: ["monitoring-correlation", portfolioId],
    enabled: !!portfolioId,
    queryFn: async ({ signal }) =>
      apiGet<PortfolioCorrelation>(`/portfolios/${portfolioId}/correlation`, {
        signal,
        token: await getToken(),
      }),
    staleTime: STALE_TIME,
  });
  const trades = usePortfolioTrades(portfolioId ?? "", tradePage, 10);

  const data = detail.data;
  const executionStrategyId = executionStrategy || data?.strategies[0]?.id || "";
  const executionEvents = useExecutionEvents(executionStrategyId, executionPage, 10);
  const correlationItems = correlation.data?.items ?? [];
  const strategyIds = Array.from(
    new Set(
      correlationItems.flatMap((pair) => [
        pair.strategy_a,
        pair.strategy_b,
      ]),
    ),
  );
  const dateLocale = locale === "es" ? "es-ES" : "en-US";

  return (
    <section className="space-y-5" aria-labelledby="portfolio-monitoring-title">
      <header className="flex flex-col gap-3 border-b border-white/[0.06] pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
        <h3 id="portfolio-monitoring-title" className="text-lg font-semibold tracking-tight">
          {copy.monitoringTitle}
        </h3>
        <p className="text-sm text-muted-foreground">
          {copy.monitoringSubtitle}
        </p>
        </div>
        {portfolios.data?.items.length ? (
          <label className="flex w-full max-w-xs flex-col gap-1.5 text-xs font-medium text-muted-foreground">
            <span className="uppercase tracking-[0.1em]">{copy.selectPortfolio}</span>
            <select
              aria-label={copy.selectPortfolio}
              className="h-10 w-full rounded-lg border border-white/10 bg-white/[0.025] px-3 text-sm text-foreground shadow-inner outline-none transition hover:border-white/20 focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
              value={portfolioId}
              onChange={(event) => { setSelectedId(event.target.value); setTradePage(0); setExecutionStrategy(""); setExecutionPage(0); }}
            >
              {portfolios.data.items.map((portfolio) => (
                <option key={portfolio.id} value={portfolio.id}>
                  {portfolio.name ?? portfolio.id}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </header>

      {portfolios.isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-live="polite">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-24" />
          ))}
        </div>
      ) : portfolios.isError ? (
        <div role="alert" className="notice-error flex flex-wrap items-center gap-3 text-sm text-destructive">
          <span>{copy.monitoringError}</span>
          <button type="button" className="underline" onClick={() => portfolios.refetch()}>
            {copy.retry}
          </button>
        </div>
      ) : !portfolios.data?.items.length ? (
        <div className="empty-state px-6 py-12 text-center text-sm text-muted-foreground"><div className="relative z-[1] mx-auto flex max-w-sm flex-col items-center gap-3"><span className="flex size-11 items-center justify-center rounded-xl border border-primary/10 bg-primary/[0.06] text-primary/80"><HeartPulse className="size-5" /></span><p>{copy.noPortfolios}</p></div></div>
      ) : detail.isLoading ? (
        <div className="space-y-4" aria-live="polite">
          <p className="sr-only">{copy.monitoringLoading}</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-72" />
        </div>
      ) : detail.isError ? (
        <div role="alert" className="notice-error flex flex-wrap items-center gap-3 text-sm text-destructive">
          <span>{copy.monitoringError}</span>
          <button type="button" className="underline" onClick={() => detail.refetch()}>
            {copy.retry}
          </button>
        </div>
      ) : !data ? (
        <div className="empty-state px-6 py-12 text-center text-sm text-muted-foreground"><div className="relative z-[1] mx-auto flex max-w-sm flex-col items-center gap-3"><span className="flex size-11 items-center justify-center rounded-xl border border-primary/10 bg-primary/[0.06] text-primary/80"><HeartPulse className="size-5" /></span><p>{copy.noPortfolios}</p></div></div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Metric
              label={copy.currentEquity}
              value={formatNumber(data.metrics?.equity)}
            />
            <Metric
              label={copy.currentDrawdown}
              value={formatPercentPoints(data.metrics?.total_dd_pct)}
            />
            <Metric
              label={copy.openAlerts}
              value={String(data.alerts.filter((alert) => alert.status === "open").length)}
            />
            <Metric label={copy.capitalTracked} value={capitalByCurrency(capital.data?.data, locale)} />
          </div>
          {capital.isError ? (
          <p role="status" className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-xs text-muted-foreground">
              {copy.capitalUnavailable} <button type="button" className="underline underline-offset-4" onClick={() => void capital.refetch()}>{copy.retry}</button>
            </p>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{copy.equityCurve}</CardTitle>
              </CardHeader>
              <CardContent className="h-60">
                {data.equity_curve.length ? (
                  <div
                    role="img"
                    aria-label={copy.equityCurve}
                    className="h-full w-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data.equity_curve}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="ts"
                          tickFormatter={(value: string) =>
                            new Date(value).toLocaleDateString(dateLocale)
                          }
                        />
                        <YAxis />
                        <Tooltip
                          labelFormatter={(value) =>
                            formatDate(String(value))
                          }
                          formatter={(value) => [formatNumber(Number(value)), copy.currentEquity]}
                        />
                        <Line
                          dataKey="equity"
                          name={copy.currentEquity}
                          stroke="var(--color-chart-1)"
                          dot={false}
                          isAnimationActive={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="chart-empty h-full px-5 text-sm">
                    <div><HeartPulse className="mx-auto mb-2 size-5 opacity-50" /><p>
                    {copy.noEquitySamples}
                    </p></div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">{copy.correlation}</CardTitle>
                {correlation.isError ? (
                  <button
                    type="button"
                    className="text-sm underline"
                    onClick={() => correlation.refetch()}
                  >
                    {copy.retry}
                  </button>
                ) : null}
              </CardHeader>
              <CardContent>
                {correlation.isLoading ? (
                  <Skeleton className="h-40" />
                ) : correlation.isError || !strategyIds.length ? (
                  <div className="chart-empty px-5 text-sm">
                    <div><HeartPulse className="mx-auto mb-2 size-5 opacity-50" /><p>
                    {copy.noCorrelations}
                    </p></div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="border-separate border-spacing-1 text-xs">
                      <caption className="sr-only">{copy.correlation}</caption>
                      <thead>
                        <tr>
                          <th scope="col" />
                          {strategyIds.map((strategyId) => (
                            <th scope="col" key={strategyId} className="p-1">
                              {strategyId}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {strategyIds.map((strategyA) => (
                          <tr key={strategyA}>
                            <th scope="row" className="p-1 text-right">
                              {strategyA}
                            </th>
                            {strategyIds.map((strategyB) => {
                              const pair = correlationItems.find(
                                (item) =>
                                  (item.strategy_a === strategyA &&
                                    item.strategy_b === strategyB) ||
                                  (item.strategy_a === strategyB &&
                                    item.strategy_b === strategyA),
                              );
                              const value =
                                strategyA === strategyB
                                  ? 1
                                  : (pair?.correlation ?? null);
                              return (
                                <td
                                  key={strategyB}
                                  title={pair ? `${strategyA} / ${strategyB} · ${pair.observations ?? "—"} ${copy.overlapDays} · ${pair.window_days ?? 60} ${copy.days} · ${pair.last_evaluated_at ?? ""}` : `${strategyA} / ${strategyB} · ${copy.noCorrelation}`}
                                  className="h-10 min-w-12 rounded bg-muted p-2 text-center"
                                >
                                  {value === null ? "—" : formatNumber(value)}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
              <p className="px-6 pb-5 text-xs leading-relaxed text-muted-foreground">{copy.correlationDataCaveat}</p>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{copy.strategiesHeading}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {data.strategies.map((strategy) => {
                const alerts = strategy.alerts ?? [];
                const rolling20 = strategy.metrics?.rolling_20;
                const openAlerts = alerts.filter((alert) => alert.status === "open");
                const critical = openAlerts.some(
                  (alert) => alert.severity === "high" || alert.severity === "critical",
                );
                const warning = openAlerts.some(
                  (alert) => alert.severity === "medium",
                );
                const observed =
                  strategy.current_mode === "demo"
                    ? copy.observedDemo
                    : strategy.current_mode === "live"
                      ? copy.observedLive
                      : copy.modeUnconfirmed;
                const expected =
                  strategy.expected_mode === "demo"
                    ? copy.accountDemo
                    : strategy.expected_mode === "live"
                      ? copy.accountReal
                      : "—";

                return (
                  <article key={strategy.id} className="rounded-xl border border-white/[0.07] bg-white/[0.018] p-4 transition-colors hover:border-white/[0.12] hover:bg-white/[0.03]">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <b>{strategy.name ?? strategy.id}</b>
                      <span
                        className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs ${
                          critical
                            ? "border border-red-300/15 bg-red-400/10 text-red-200"
                            : warning
                              ? "border border-amber-300/15 bg-amber-300/10 text-amber-100"
                              : "border border-white/[0.07] bg-white/[0.035] text-muted-foreground"
                        }`}
                      >
                        {critical ? (
                          <AlertTriangle aria-hidden="true" className="size-3" />
                        ) : (
                          <HeartPulse aria-hidden="true" className="size-3" />
                        )}
                        {critical
                          ? copy.attention
                          : warning
                            ? copy.warning
                            : openAlerts.length
                              ? t(copy.alertCount, { count: openAlerts.length })
                              : copy.noAlerts}
                      </span>
                    </div>
                    <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                      <div>
                        <dt className="inline font-medium">{copy.expected}: </dt>
                        <dd className="inline">{expected}</dd>
                      </div>
                      <div>
                        <dt className="inline font-medium">{copy.observed}: </dt>
                        <dd className="inline">{observed}</dd>
                      </div>
                      {strategy.mode_status === "mode_mismatch" ? (
                        <div className="text-amber-200 sm:col-span-2">
                          {copy.modeMismatch}
                        </div>
                      ) : null}
                      <div>
                        <dt className="inline font-medium">{copy.currentEquity}: </dt>
                        <dd className="inline">
                          {formatNumber(strategy.metrics?.equity)}
                        </dd>
                      </div>
                      <div>
                        <dt className="inline font-medium">{copy.currentDrawdown}: </dt>
                        <dd className="inline">
                          {formatPercentPoints(strategy.metrics?.total_dd_pct)}
                        </dd>
                      </div>
                      <div>
                        <dt className="inline font-medium">{copy.lastHeartbeat}: </dt>
                        <dd className="inline">
                          {strategy.last_heartbeat_at
                            ? new Date(strategy.last_heartbeat_at).toLocaleString(dateLocale)
                            : "—"}
                        </dd>
                      </div>
                      <div>
                        <dt className="inline font-medium">{copy.modeObservedAt}: </dt>
                        <dd className="inline">
                          {strategy.mode_observed_at
                            ? new Date(strategy.mode_observed_at).toLocaleString(dateLocale)
                            : "—"}
                        </dd>
                      </div>
                    </dl>
                    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
                      {[
                        [copy.rollingSample, rolling20?.n_trades == null ? "—" : `${rolling20.n_trades}/20`],
                        [copy.winRate, formatPercentPoints(rolling20?.win_rate)],
                        [copy.profitFactor, formatNumber(rolling20?.profit_factor)],
                        [copy.expectancy, formatPercentPoints(rolling20?.expectancy_pct)],
                        [copy.lossStreak, strategy.metrics?.current_loss_streak == null ? "—" : String(strategy.metrics.current_loss_streak)],
                      ].map(([label, value]) => (
                        <div key={label} className="min-w-0 rounded-lg border border-white/[0.07] bg-black/10 px-2.5 py-2">
                          <dt className="truncate text-[10px] text-muted-foreground">{label}</dt>
                          <dd className="mt-1 truncate text-sm font-semibold tabular-nums">{value}</dd>
                        </div>
                      ))}
                    </div>
                  </article>
                );
              })}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base">{locale === "es" ? "Operaciones recientes" : "Recent executions"}</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">{locale === "es" ? "Resultados netos y costos reportados por MT5" : "Net results and costs reported by MT5"}</p>
              </div>
              <button type="button" onClick={() => void trades.refetch()} disabled={trades.isFetching} className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors hover:bg-muted disabled:opacity-50">
                <RefreshCw className={`size-3.5 ${trades.isFetching ? "animate-spin" : ""}`} aria-hidden="true" />
                {locale === "es" ? "Actualizar" : "Refresh"}
              </button>
            </CardHeader>
            <CardContent>
              {trades.isError ? (
                <div role="alert" className="notice-error flex flex-wrap items-center justify-between gap-3 text-sm text-destructive">
                  <span>{copy.monitoringError}</span><button type="button" className="underline" onClick={() => void trades.refetch()}>{copy.retry}</button>
                </div>
              ) : trades.isLoading ? (
                <div className="space-y-2" aria-live="polite">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-12" />)}</div>
              ) : (trades.data?.data?.items.length ?? 0) === 0 ? (
                <div className="chart-empty px-5 text-sm">{locale === "es" ? "Todavía no hay operaciones registradas para este portafolio." : "No executions have been recorded for this portfolio yet."}</div>
              ) : (
                <>
                  <div className="space-y-3 md:hidden">
                    {trades.data?.data?.items.map((trade) => <ExecutionCard key={trade.id} trade={trade} locale={locale} />)}
                  </div>
                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full min-w-[900px] text-sm">
                      <thead><tr className="border-b text-left text-xs text-muted-foreground"><th className="py-3 pr-3">{locale === "es" ? "Cierre" : "Closed"}</th><th className="py-3 pr-3">{locale === "es" ? "Estrategia / activo" : "Strategy / symbol"}</th><th className="py-3 pr-3">{locale === "es" ? "Lado" : "Side"}</th><th className="py-3 pr-3 text-right">{locale === "es" ? "Volumen" : "Volume"}</th><th className="py-3 pr-3 text-right">P&L</th><th className="py-3 pr-3 text-right">{locale === "es" ? "Comisión" : "Commission"}</th><th className="py-3 pr-3 text-right">{locale === "es" ? "Swap" : "Swap"}</th><th className="py-3 text-right">{locale === "es" ? "Spread / slippage" : "Spread / slippage"}</th></tr></thead>
                      <tbody>{trades.data?.data?.items.map((trade) => <ExecutionRow key={trade.id} trade={trade} />)}</tbody>
                    </table>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3 border-t pt-3 text-xs text-muted-foreground">
                    <span>{locale === "es" ? `Mostrando ${trades.data?.data?.items.length ?? 0} de ${trades.data?.data?.total ?? "—"} operaciones` : `Showing ${trades.data?.data?.items.length ?? 0} of ${trades.data?.data?.total ?? "—"} executions`}</span>
                    <div className="flex items-center gap-2">
                      <button type="button" aria-label={locale === "es" ? "Página anterior de operaciones" : "Previous executions page"} onClick={() => setTradePage((page) => Math.max(0, page - 1))} disabled={tradePage === 0 || trades.isFetching} className="rounded-md border p-2 hover:bg-muted disabled:opacity-40"><ChevronLeft className="size-4" /></button>
                      <span>{tradePage + 1}</span>
                      <button type="button" aria-label={locale === "es" ? "Página siguiente de operaciones" : "Next executions page"} onClick={() => setTradePage((page) => page + 1)} disabled={tradePage + 1 >= Math.ceil((trades.data?.data?.total ?? 0) / 10) || trades.isFetching} className="rounded-md border p-2 hover:bg-muted disabled:opacity-40"><ChevronRight className="size-4" /></button>
                    </div>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{locale === "es" ? "Los costos que no fueron enviados por el EA se muestran como —; no se estiman. El P&L es el valor neto reportado por el broker." : "Costs not sent by the EA appear as —; they are not estimated. P&L is the net value reported by the broker."}</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base">{locale === "es" ? "Señales y ejecución" : "Signals and execution"}</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">{locale === "es" ? "Referencia de entrada y resultado comunicado por el EA" : "Entry reference and outcome reported by the EA"}</p>
              </div>
              {data.strategies.length > 1 ? (
                <label className="flex flex-col gap-1 text-xs sm:min-w-56">
                  <span>{locale === "es" ? "Estrategia" : "Strategy"}</span>
                  <select className="h-9 rounded-lg border border-white/10 bg-white/[0.025] px-3 text-sm text-foreground outline-none transition hover:border-white/20 focus:border-primary/50 focus:ring-2 focus:ring-primary/10" value={executionStrategyId} onChange={(event) => { setExecutionStrategy(event.target.value); setExecutionPage(0); }}>
                    {data.strategies.map((strategy) => <option key={strategy.id} value={strategy.id}>{strategy.name ?? strategy.id}</option>)}
                  </select>
                </label>
              ) : null}
            </CardHeader>
            <CardContent>
              {executionEvents.isError ? (
                <div role="alert" className="notice-error flex flex-wrap items-center justify-between gap-3 text-sm text-destructive"><span>{copy.monitoringError}</span><button type="button" onClick={() => void executionEvents.refetch()}>{copy.retry}</button></div>
              ) : executionEvents.isLoading ? (
                <div className="space-y-2" aria-live="polite">{Array.from({ length: 3 }, (_, index) => <Skeleton key={index} className="h-16" />)}</div>
              ) : (executionEvents.data?.data?.items.length ?? 0) === 0 ? (
                <div className="chart-empty px-5 text-sm">{locale === "es" ? "El EA todavía no ha enviado eventos de señal. Se muestran solo eventos que el broker y el EA reportan; no se infieren estados." : "The EA has not sent signal events yet. Only broker and EA reported events are shown; statuses are never inferred."}</div>
              ) : (
                <>
                  <ol className="space-y-2">
                    {executionEvents.data?.data?.items.map((event) => {
                      const intent = event.event_type === "signal_intent";
                      const payload = event.payload;
                      const label = intent ? (locale === "es" ? "Intención" : "Intent") : (locale === "es" ? "Resultado" : "Outcome");
                      const status = intent ? (locale === "es" ? "señal enviada" : "signal sent") : payload.status ?? event.ingest_status;
                      return (
                        <li key={event.id} className="flex flex-col gap-2 rounded-xl border border-white/[0.07] bg-white/[0.018] p-3.5 transition-colors hover:border-white/[0.12] hover:bg-white/[0.03] sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium">{label}</span><span className="text-xs text-muted-foreground">{payload.signal_id ?? "—"}</span></div><p className="mt-1 text-sm font-medium">{payload.symbol ?? executionStrategyId} {payload.direction ? `· ${payload.direction}` : ""}</p><p className="text-xs text-muted-foreground">{intent ? `${locale === "es" ? "Referencia" : "Reference"}: ${formatNumber(payload.reference_price)} · ${locale === "es" ? "Solicitado" : "Requested"}: ${formatNumber(payload.volume, 3)}` : `${locale === "es" ? "Ejecutado" : "Filled"}: ${formatNumber(payload.filled_volume, 3)} · ${locale === "es" ? "Precio medio" : "Average price"}: ${formatNumber(payload.fill_price)}${payload.reason ? ` · ${payload.reason}` : ""}`}</p></div>
                          <div className="flex shrink-0 items-center justify-between gap-3 text-xs sm:flex-col sm:items-end"><span className="rounded-full border px-2.5 py-1 capitalize">{status}</span><time className="text-muted-foreground">{formatDate(event.ts ?? event.received_at)}</time></div>
                        </li>
                      );
                    })}
                  </ol>
                  <div className="mt-4 flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
                    <span>{locale === "es" ? `${executionEvents.data?.data?.total ?? 0} eventos` : `${executionEvents.data?.data?.total ?? 0} events`}</span>
                    <div className="flex items-center gap-2"><button type="button" aria-label={locale === "es" ? "Página anterior de eventos" : "Previous events page"} onClick={() => setExecutionPage((page) => Math.max(0, page - 1))} disabled={executionPage === 0 || executionEvents.isFetching} className="rounded-md border p-2 hover:bg-muted disabled:opacity-40"><ChevronLeft className="size-4" /></button><span>{executionPage + 1}</span><button type="button" aria-label={locale === "es" ? "Página siguiente de eventos" : "Next events page"} onClick={() => setExecutionPage((page) => page + 1)} disabled={executionPage + 1 >= Math.ceil((executionEvents.data?.data?.total ?? 0) / 10) || executionEvents.isFetching} className="rounded-md border p-2 hover:bg-muted disabled:opacity-40"><ChevronRight className="size-4" /></button></div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          <p className="text-xs text-muted-foreground">
            {copy.dataUnavailableNote}
          </p>
        </>
      )}
    </section>
  );
}

function formatTradeMoney(value: number | null | undefined, currency?: string | null) {
  if (value == null || !Number.isFinite(value)) return "—";
  const code = currency && /^[A-Z]{3}$/.test(currency) ? currency : "USD";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${code} ${formatNumber(value)}`;
  }
}

function tradeSide(trade: Trade) {
  return trade.trade_type ?? trade.direction ?? trade.side ?? "—";
}

function ExecutionRow({ trade }: { trade: Trade }) {
  const pnl = trade.profit ?? trade.pnl;
  const instrument = trade.symbol ?? trade.instrument ?? "—";
  const costs = [trade.spread_cost, trade.slippage]
    .filter((value): value is number => value != null && Number.isFinite(value));
  return (
    <tr className="border-b border-border/60 transition-colors hover:bg-muted/30 last:border-0">
      <td className="py-3 pr-3 text-muted-foreground">{formatDate(trade.exit_time)}</td>
      <td className="py-3 pr-3"><span className="block font-medium">{trade.strategy_id}</span><span className="text-xs text-muted-foreground">{instrument}</span></td>
      <td className="py-3 pr-3 capitalize">{tradeSide(trade)}</td>
      <td className="py-3 pr-3 text-right tabular-nums">{formatNumber(trade.volume ?? trade.quantity, 3)}</td>
      <td className={`py-3 pr-3 text-right font-medium tabular-nums ${pnl == null ? "text-muted-foreground" : pnl >= 0 ? "text-emerald-500" : "text-destructive"}`}>{formatTradeMoney(pnl, trade.currency)}</td>
      <td className="py-3 pr-3 text-right tabular-nums">{formatTradeMoney(trade.commission, trade.currency)}</td>
      <td className="py-3 pr-3 text-right tabular-nums">{formatTradeMoney(trade.swap, trade.currency)}</td>
      <td className="py-3 text-right tabular-nums">{costs.length ? costs.map((cost) => formatTradeMoney(cost, trade.currency)).join(" / ") : "—"}</td>
    </tr>
  );
}

function ExecutionCard({ trade, locale }: { trade: Trade; locale: string }) {
  const pnl = trade.profit ?? trade.pnl;
  const instrument = trade.symbol ?? trade.instrument ?? "—";
  const currency = trade.currency;
  return (
    <article className="rounded-lg border p-3 transition-colors hover:bg-muted/20">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0"><p className="truncate text-sm font-medium">{trade.strategy_id}</p><p className="text-xs text-muted-foreground">{instrument} · {tradeSide(trade)}</p></div>
        <p className={`shrink-0 text-sm font-semibold tabular-nums ${pnl == null ? "text-muted-foreground" : pnl >= 0 ? "text-emerald-500" : "text-destructive"}`}>{formatTradeMoney(pnl, currency)}</p>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{formatDate(trade.exit_time)} · {locale === "es" ? "Volumen" : "Volume"} {formatNumber(trade.volume ?? trade.quantity, 3)}</p>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-xs"><div><dt className="text-muted-foreground">{locale === "es" ? "Comisión" : "Commission"}</dt><dd className="mt-0.5 tabular-nums">{formatTradeMoney(trade.commission, currency)}</dd></div><div><dt className="text-muted-foreground">Swap</dt><dd className="mt-0.5 tabular-nums">{formatTradeMoney(trade.swap, currency)}</dd></div><div><dt className="text-muted-foreground">{locale === "es" ? "Spread" : "Spread"}</dt><dd className="mt-0.5 tabular-nums">{formatTradeMoney(trade.spread_cost, currency)}</dd></div><div><dt className="text-muted-foreground">Slippage</dt><dd className="mt-0.5 tabular-nums">{formatNumber(trade.slippage)}</dd></div></dl>
    </article>
  );
}
