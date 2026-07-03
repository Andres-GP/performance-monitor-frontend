"use client";

import { useCallback, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
import { useAlerts, useStrategies } from "@/lib/queries";
import { formatDate } from "@/lib/format";
import { useI18n } from "@/lib/i18n/context";

export function AlertsView() {
  const { dict } = useI18n();
  const { data, isLoading } = useAlerts(200);
  const strategies = useStrategies();

  const [strategy, setStrategy] = useState("all");
  const [severity, setSeverity] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(0);

  const alerts = data?.data ?? [];
  const strategyList = strategies.data?.data ?? [];

  // Opciones traducidas para el select de estrategia
  const strategyItems = useMemo(() => {
    const items: Record<string, string> = {
      all: dict.alerts.all,
    };
    strategyList.forEach((s) => {
      items[s.id] = s.name; // El nombre de la estrategia ya viene del backend, no se traduce
    });
    return items;
  }, [strategyList, dict.alerts.all]);

  // Opciones traducidas para severidad
  const severityItems = {
    all: dict.alerts.all,
    high: dict.alerts.high,
    medium: dict.alerts.medium,
    low: dict.alerts.low,
  };

  const filtered = useMemo(() => {
    const fromTime = from ? new Date(from).getTime() : null;
    const toTime = to ? new Date(to).getTime() + 86_400_000 : null;
    return alerts.filter((a) => {
      const t = new Date(a.timestamp).getTime();
      const matchStrategy = strategy === "all" || a.strategy_id === strategy;
      const matchSeverity = severity === "all" || a.severity === severity;
      const matchFrom = fromTime == null || t >= fromTime;
      const matchTo = toTime == null || t <= toTime;
      return matchStrategy && matchSeverity && matchFrom && matchTo;
    });
  }, [alerts, strategy, severity, from, to]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const pageAlerts = filtered.slice(
    safePage * pageSize,
    safePage * pageSize + pageSize,
  );

  const resetPage = useCallback(
    (setter: (v: string) => void) => (v: string) => {
      setter(v);
      setPage(0);
    },
    [],
  );

  const handleStrategyChange = useCallback(resetPage(setStrategy), [resetPage]);
  const handleSeverityChange = useCallback(resetPage(setSeverity), [resetPage]);
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
  const handlePageSizeChange = useCallback((v: string) => {
    setPageSize(Number(v));
    setPage(0);
  }, []);
  const handlePrevPage = useCallback(
    () => setPage((p) => Math.max(0, p - 1)),
    [],
  );
  const handleNextPage = useCallback(
    () => setPage((p) => Math.min(totalPages - 1, p + 1)),
    [totalPages],
  );

  // Función auxiliar para interpolación de placeholders
  const interpolate = (
    template: string,
    values: Record<string, string | number>,
  ) => template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ""));

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold">{dict.alerts.title}</h2>
        <p className="text-sm text-muted-foreground">{dict.alerts.subtitle}</p>
      </div>

      {data?.isFallback && <OfflineBanner />}

      <Card>
        <CardContent className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
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
                  <SelectItem key={s.id} value={s.id}>
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
                <SelectItem value="high">{dict.alerts.high}</SelectItem>
                <SelectItem value="medium">{dict.alerts.medium}</SelectItem>
                <SelectItem value="low">{dict.alerts.low}</SelectItem>
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

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          {dict.alerts.empty}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-border">
            <Table className="min-w-[700px]">
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
                  <TableHead className="text-right">
                    {dict.alerts.colDate}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageAlerts.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">
                      {a.problem_type}
                    </TableCell>
                    <TableCell className="hidden max-w-sm md:table-cell">
                      <div
                        className="max-w-[250px] overflow-hidden text-ellipsis whitespace-nowrap text-muted-foreground"
                        title={a.details ?? "—"}
                      >
                        {a.details ?? "—"}
                      </div>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">
                      {a.strategy_name ?? a.strategy_id}
                    </TableCell>
                    <TableCell>
                      <SeverityBadge severity={a.severity} />
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatDate(a.timestamp)}
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
                  count: filtered.length,
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
