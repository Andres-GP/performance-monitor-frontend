"use client";

import { useMemo, useState } from "react";
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

export function AlertsView() {
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

  const strategyItems: Record<string, string> = {
    all: "Todas",
    ...Object.fromEntries(strategyList.map((s) => [s.id, s.name])),
  };
  const severityItems = {
    all: "Todas",
    high: "Alta",
    medium: "Media",
    low: "Baja",
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

  function resetPage<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v);
      setPage(0);
    };
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold">Alertas de Salud</h2>
        <p className="text-sm text-muted-foreground">
          Eventos de salud detectados en todas las estrategias monitoreadas
        </p>
      </div>

      {data?.isFallback && <OfflineBanner />}

      <Card>
        <CardContent className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Estrategia</Label>
            <Select
              items={strategyItems}
              value={strategy}
              onValueChange={resetPage((v) => setStrategy(v as string))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Estrategia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
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
              Severidadaaa
            </Label>
            <Select
              items={severityItems}
              value={severity}
              onValueChange={resetPage((v) => setSeverity(v as string))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Severidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="medium">Media</SelectItem>
                <SelectItem value="low">Baja</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="from" className="text-xs text-muted-foreground">
              Desde
            </Label>
            <Input
              id="from"
              type="date"
              value={from}
              onChange={(e) => resetPage(setFrom)(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="to" className="text-xs text-muted-foreground">
              Hasta
            </Label>
            <Input
              id="to"
              type="date"
              value={to}
              onChange={(e) => resetPage(setTo)(e.target.value)}
            />
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
          No hay alertas que coincidan con los filtros.
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Problema</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Detalles
                  </TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Estrategia
                  </TableHead>
                  <TableHead>Severidad</TableHead>
                  <TableHead className="text-right">Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageAlerts.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.problem}</TableCell>
                    <TableCell className="hidden max-w-sm text-muted-foreground md:table-cell">
                      {a.details ?? "—"}
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
              <span>Por página</span>
              <Select
                value={String(pageSize)}
                onValueChange={(v) => {
                  setPageSize(Number(v));
                  setPage(0);
                }}
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
                {filtered.length} alertas · página {safePage + 1} de{" "}
                {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label="Página anterior"
                  disabled={safePage === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label="Página siguiente"
                  disabled={safePage >= totalPages - 1}
                  onClick={() =>
                    setPage((p) => Math.min(totalPages - 1, p + 1))
                  }
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
