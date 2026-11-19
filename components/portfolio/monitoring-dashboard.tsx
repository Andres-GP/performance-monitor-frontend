"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, HeartPulse } from "lucide-react";
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
import { useApiToken } from "@/lib/queries";
import { formatDate, formatNumber, formatPercentPoints } from "@/lib/format";

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
  metrics?: { equity?: number | null; total_dd_pct?: number | null } | null;
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
  }>;
}

const STALE_TIME = 60_000;

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{label}</CardTitle>
      </CardHeader>
      <CardContent className="text-xl font-semibold">{value}</CardContent>
    </Card>
  );
}

export function MonitoringPortfolioDashboard() {
  const getToken = useApiToken();
  const { dict, locale, t } = useI18n();
  const copy = dict.portfolio;
  const [selectedId, setSelectedId] = useState<string>();

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

  const data = detail.data;
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
    <section className="space-y-4" aria-labelledby="portfolio-monitoring-title">
      <header>
        <h3 id="portfolio-monitoring-title" className="text-lg font-semibold">
          {copy.monitoringTitle}
        </h3>
        <p className="text-sm text-muted-foreground">
          {copy.monitoringSubtitle}
        </p>
        {portfolios.data?.items.length ? (
          <label className="mt-3 flex max-w-md flex-col gap-1 text-sm">
            <span>{copy.selectPortfolio}</span>
            <select
              aria-label={copy.selectPortfolio}
              className="rounded-md border bg-background p-2"
              value={portfolioId}
              onChange={(event) => setSelectedId(event.target.value)}
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
        <div role="alert" className="flex flex-wrap items-center gap-3 text-sm text-destructive">
          <span>{copy.monitoringError}</span>
          <button type="button" className="underline" onClick={() => portfolios.refetch()}>
            {copy.retry}
          </button>
        </div>
      ) : !portfolios.data?.items.length ? (
        <p className="text-sm text-muted-foreground">{copy.noPortfolios}</p>
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
        <div role="alert" className="flex flex-wrap items-center gap-3 text-sm text-destructive">
          <span>{copy.monitoringError}</span>
          <button type="button" className="underline" onClick={() => detail.refetch()}>
            {copy.retry}
          </button>
        </div>
      ) : !data ? (
        <p className="text-sm text-muted-foreground">{copy.noPortfolios}</p>
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
            <Metric label={copy.freeMargin} value="—" />
          </div>

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
                  <p className="text-sm text-muted-foreground">
                    {copy.noEquitySamples}
                  </p>
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
                  <p className="text-sm text-muted-foreground">
                    {copy.noCorrelations}
                  </p>
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
                                  title={`${strategyA} / ${strategyB}`}
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
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{copy.strategiesHeading}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {data.strategies.map((strategy) => {
                const alerts = strategy.alerts ?? [];
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
                  <article key={strategy.id} className="rounded-lg border p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <b>{strategy.name ?? strategy.id}</b>
                      <span
                        className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs ${
                          critical
                            ? "bg-red-100 text-red-800"
                            : warning
                              ? "bg-amber-100 text-amber-900"
                              : "bg-muted text-muted-foreground"
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
                        <div className="text-amber-700 sm:col-span-2">
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
                    <p className="mt-3 text-xs text-muted-foreground">
                      {copy.noExecutionDetails}
                    </p>
                  </article>
                );
              })}
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
