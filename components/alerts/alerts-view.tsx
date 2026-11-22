"use client";

import { useCallback, useMemo, useState } from "react";
import { Bell, ChevronLeft, ChevronRight } from "lucide-react";
import { SeverityBadge } from "@/components/shared/badges";
import { OfflineBanner } from "@/components/shared/offline-banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAcknowledgeAlert, useAlerts, useStrategies } from "@/lib/queries";
import { formatDate } from "@/lib/format";
import { useI18n } from "@/lib/i18n/context";
import type { Alert, Strategy } from "@/types";

const EMPTY_ALERTS: Alert[] = [];
const EMPTY_STRATEGIES: Strategy[] = [];

function summarizeContext(context: Alert["context"]): string {
  if (!context || typeof context !== "object") return "—";
  const preferred = ["message", "description", "reason", "correlation", "observations", "window_days", "ticket"];
  const entries = [...preferred.flatMap((key) => key in context ? [[key, context[key]] as const] : []),
    ...Object.entries(context).filter(([key]) => !preferred.includes(key))];
  return entries
    .filter(([, value]) => value !== null && value !== undefined)
    .slice(0, 5)
    .map(([key, value]) => `${key.replaceAll("_", " ")}: ${typeof value === "object" ? JSON.stringify(value) : String(value)}`)
    .join(" · ") || "—";
}

export function AlertsView() {
  const { dict } = useI18n();
  const strategies = useStrategies();
  const acknowledge = useAcknowledgeAlert();

  const [strategy, setStrategy] = useState("all");
  const [severity, setSeverity] = useState("all");
  const [status, setStatus] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(0);

  const requestLimit = strategy === "all" ? pageSize : 1000;
  const requestOffset = strategy === "all" ? page * pageSize : 0;
  const dateRangeInvalid = Boolean(from && to && from > to);
  const alertsQuery = useAlerts(requestLimit, {
    enabled: !dateRangeInvalid,
    offset: requestOffset,
    status: status === "all" ? undefined : status as "open" | "ack" | "resolved",
    severity: severity === "all" ? undefined : severity as Alert["severity"],
    from: from ? `${from}T00:00:00Z` : undefined,
    to: to ? `${to}T23:59:59.999Z` : undefined,
  });
  const { data, isLoading } = alertsQuery;

  const alerts = data?.data?.items ?? EMPTY_ALERTS;
  const strategyList = strategies.data?.data ?? EMPTY_STRATEGIES;

  const strategyItems = useMemo(() => {
    const items: Record<string, string> = {
      all: dict.alerts.all,
    };
    strategyList.forEach((s) => {
      items[s.strategy_id] = s.name;
    });
    return items;
  }, [strategyList, dict.alerts.all]);

  const severityItems = {
    all: dict.alerts.all,
    critical: dict.severity.critical,
    high: dict.alerts.high,
    medium: dict.alerts.medium,
    info: dict.severity.info,
  };

  const statusItems = {
    all: dict.alerts.all,
    open: dict.alerts.open,
    ack: dict.alerts.acknowledged,
    resolved: dict.alerts.resolved,
  };

  const filtered = useMemo(() => {
    return alerts.filter((alert) => strategy === "all" || alert.strategy_id === strategy);
  }, [alerts, strategy]);

  const totalAlerts = strategy === "all" ? data?.data?.total ?? filtered.length : filtered.length;
  const strategyFilterLimited = strategy !== "all" && (data?.data?.total ?? 0) > alerts.length;
  const totalPages = Math.max(1, Math.ceil(totalAlerts / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const pageAlerts = strategy === "all"
    ? filtered
    : filtered.slice(safePage * pageSize, safePage * pageSize + pageSize);

  const handleStrategyChange = useCallback((value: string | null) => {
    if (value === null) return;
    setStrategy(value);
    setPage(0);
  }, []);

  const handleSeverityChange = useCallback((value: string | null) => {
    if (value === null) return;
    setSeverity(value);
    setPage(0);
  }, []);

  const handleStatusChange = useCallback((value: string | null) => {
    if (value === null) return;
    setStatus(value);
    setPage(0);
  }, []);

  const handleFromChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFrom(e.target.value);
      setPage(0);
    },
    [],
  );

  const handleToChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTo(e.target.value);
      setPage(0);
    },
    [],
  );

  const handlePageSizeChange = useCallback((value: string | null) => {
    if (value === null) return;
    setPageSize(Number(value));
    setPage(0);
  }, []);

  const handlePrevPage = useCallback(() => {
    setPage((p) => Math.max(0, p - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setPage((p) => Math.min(totalPages - 1, p + 1));
  }, [totalPages]);

  const interpolate = (
    template: string,
    values: Record<string, string | number>,
  ) => template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ""));

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
      <div className="border-b border-white/[0.06] pb-4">
        <h2 className="text-2xl font-semibold tracking-tight">{dict.alerts.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{dict.alerts.subtitle}</p>
      </div>

      {data?.isFallback && <OfflineBanner />}
      {(strategies.isError || strategies.data?.isFallback) && (
        <p role="status" className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-xs text-muted-foreground">
          {dict.alerts.strategiesUnavailable} <button type="button" className="underline underline-offset-4" onClick={() => void strategies.refetch()} disabled={strategies.isFetching}>{dict.alerts.retry}</button>
        </p>
      )}
      {dateRangeInvalid && <p role="alert" className="notice-warning rounded-xl px-4 py-3 text-sm text-amber-100">{dict.alerts.dateRangeError}</p>}
      {strategyFilterLimited && <p className="rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground">{dict.alerts.strategyFilterLimit}</p>}

      <Card>
        <CardContent className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">
              {dict.alerts.filterStrategy}
            </Label>
            <Select
              items={strategyItems}
              value={strategy}
              onValueChange={handleStrategyChange}
            >
              <SelectTrigger>
                <SelectValue placeholder={dict.alerts.filterStrategy} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{dict.alerts.all}</SelectItem>
                {strategyList.map((s) => (
                  <SelectItem key={s.strategy_id} value={s.strategy_id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">
              {dict.alerts.filterSeverity}
            </Label>
            <Select
              items={severityItems}
              value={severity}
              onValueChange={handleSeverityChange}
            >
              <SelectTrigger>
                <SelectValue placeholder={dict.alerts.filterSeverity} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{dict.alerts.all}</SelectItem>
                <SelectItem value="critical">{dict.severity.critical}</SelectItem>
                <SelectItem value="high">{dict.alerts.high}</SelectItem>
                <SelectItem value="medium">{dict.alerts.medium}</SelectItem>
                <SelectItem value="info">{dict.severity.info}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">{dict.alerts.filterStatus}</Label>
            <Select items={statusItems} value={status} onValueChange={handleStatusChange}>
              <SelectTrigger><SelectValue placeholder={dict.alerts.filterStatus} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{dict.alerts.all}</SelectItem>
                <SelectItem value="open">{dict.alerts.open}</SelectItem>
                <SelectItem value="ack">{dict.alerts.acknowledged}</SelectItem>
                <SelectItem value="resolved">{dict.alerts.resolved}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="from" className="text-xs text-muted-foreground">
              {dict.alerts.filterFrom}
            </Label>
            <Input
              id="from"
              type="date"
              value={from}
              onChange={handleFromChange}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="to" className="text-xs text-muted-foreground">
              {dict.alerts.filterTo}
            </Label>
            <Input id="to" type="date" value={to} onChange={handleToChange} />
          </div>
        </CardContent>
      </Card>

      {alertsQuery.isError ? (
        <div role="alert" className="notice-error flex items-center justify-between gap-3 text-sm text-destructive">
          <span>{dict.alerts.loadError}</span>
          <Button variant="outline" size="sm" onClick={() => alertsQuery.refetch()}>{dict.alerts.retry}</Button>
        </div>
      ) : dateRangeInvalid ? null : isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : data?.isFallback ? (
        <div role="alert" className="notice-error flex flex-wrap items-center justify-between gap-3 text-sm">
          <span>{dict.alerts.loadError}</span>
          <Button variant="outline" size="sm" onClick={() => void alertsQuery.refetch()} disabled={alertsQuery.isFetching}>{dict.alerts.retry}</Button>
        </div>
      ) : totalAlerts === 0 || filtered.length === 0 ? (
        <div className="empty-state px-6 py-14 text-center text-sm text-muted-foreground">
          <div className="relative z-[1] mx-auto flex max-w-sm flex-col items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl border border-primary/10 bg-primary/[0.06] text-primary/80"><Bell className="size-5" /></span>
            <p>{dict.alerts.empty}</p>
          </div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-border">
            <Table className="min-w-[760px]">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>{dict.alerts.colProblem}</TableHead>
                  <TableHead className="hidden md:table-cell">
                    {dict.alerts.colDetails}
                  </TableHead>
                  <TableHead className="hidden sm:table-cell">
                    {dict.alerts.colStrategy}
                  </TableHead>
                  <TableHead>{dict.alerts.colSeverity}</TableHead>
                  <TableHead>{dict.alerts.filterStatus}</TableHead>
                  <TableHead className="text-right">
                    {dict.alerts.colDate}
                  </TableHead>
                  <TableHead className="text-right">{dict.alerts.acknowledge}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageAlerts.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">
                      {a.problem_type ?? a.rule_key ?? a.problem ?? "—"}
                      {a.count && a.count > 1 ? <span className="ml-2 text-xs text-muted-foreground">×{a.count}</span> : null}
                    </TableCell>
                    <TableCell className="hidden max-w-sm md:table-cell">
                      <div
                        className="max-w-[250px] overflow-hidden text-ellipsis whitespace-nowrap text-muted-foreground"
                        title={a.details ?? summarizeContext(a.context)}
                      >
                        {a.details ?? summarizeContext(a.context)}
                      </div>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">
                      {a.strategy_name ?? (a.strategy_id ? strategyItems[a.strategy_id] : undefined) ?? a.strategy_id ?? a.portfolio_id ?? "—"}
                    </TableCell>
                    <TableCell>
                      <SeverityBadge severity={a.severity} />
                    </TableCell>
                    <TableCell>
                      <span className={a.status === "open" ? "rounded-full border border-amber-300/20 bg-amber-300/10 px-2 py-1 text-xs text-amber-100" : "rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-xs text-muted-foreground"}>
                        {a.status === "open" ? dict.alerts.open : a.status === "ack" ? dict.alerts.acknowledged : a.status === "resolved" ? dict.alerts.resolved : "—"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatDate(a.last_seen ?? a.first_seen ?? a.timestamp)}
                    </TableCell>
                    <TableCell className="text-right">
                      {a.status === "open" ? (
                        <Button size="sm" variant="outline" disabled={acknowledge.isPending} onClick={() => acknowledge.mutate(a.id)}>
                          {dict.alerts.acknowledge}
                        </Button>
                      ) : a.status === "ack" ? dict.alerts.acknowledged : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{dict.alerts.perPage}</span>
              <Select
                value={String(pageSize)}
                onValueChange={handlePageSizeChange}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>
                {interpolate(dict.alerts.count, {
                  count: totalAlerts,
                  page: safePage + 1,
                  total: totalPages,
                })}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label={dict.alerts.prevPage}
                  disabled={safePage === 0}
                  onClick={handlePrevPage}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label={dict.alerts.nextPage}
                  disabled={safePage >= totalPages - 1}
                  onClick={handleNextPage}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
