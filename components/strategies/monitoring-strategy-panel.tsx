"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  BriefcaseBusiness,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { apiGet } from "@/lib/api-client";
import { useApiToken } from "@/lib/queries";

type Position = {
  ticket: string;
  symbol: string;
  direction: "long" | "short";
  volume: number;
  entry_price: number;
  current_price: number;
  profit: number;
  swap: number;
  risk_at_stop: number | null;
};
type Detail = {
  strategy: { id: string; name?: string; baselines?: { oos_profit_factor?: number | null; mc_expected_max_dd_pct?: number | null } };
  metrics: {
    win_rate?: number | null;
    profit_factor?: number | null;
    average_net_per_trade?: number | null;
    t_stat_net_per_trade?: number | null;
    max_dd_pct?: number | null;
    total_dd_pct?: number | null;
    trade_count?: number;
    trades_per_year_live_90d?: number | null;
    trades_per_year_expected?: number | null;
    frequency_vs_expected_pct?: number | null;
    rolling_50?: { profit_factor?: number | null; average_net_per_trade?: number | null };
  } | null;
  alerts: { id: number; rule_key: string; severity?: string; status: string }[];
  positions: Position[] | null;
  position_state: "fresh" | "stale" | "unavailable";
  position_snapshot_at: string | null;
};
type Page<T> = { items: T[]; total: number | null };
type Trade = { id: number; symbol?: string; trade_type?: string; entry_time?: string; exit_time?: string; profit?: number };
type Equity = { ts: string; equity: number };

const number = (value: unknown, digits = 2) =>
  typeof value === "number" && Number.isFinite(value)
    ? new Intl.NumberFormat("es-CO", { maximumFractionDigits: digits }).format(value)
    : "Sin muestra";
const dateTime = (value?: string) => value ? new Intl.DateTimeFormat("es-CO", {
  dateStyle: "medium", timeStyle: "short", timeZone: "UTC",
}).format(new Date(value)) : "—";

function Metric({ label, value, detail, icon: Icon }: {
  label: string;
  value: string;
  detail: string;
  icon: typeof Activity;
}) {
  return (
    <Card className="group relative overflow-hidden border-white/[0.075] bg-gradient-to-br from-white/[0.045] to-transparent transition duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-[0_12px_36px_-24px_hsl(var(--primary)/.35)]">
      <CardContent className="flex min-h-32 items-start justify-between gap-3 p-4 sm:p-5">
        <div className="min-w-0 space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">{label}</p>
          <p className="metric-number truncate text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
          <p className="text-xs leading-relaxed text-muted-foreground">{detail}</p>
        </div>
        <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-primary/15 bg-primary/[0.08] text-primary transition duration-300 group-hover:scale-105 group-hover:bg-primary/[0.13]">
          <Icon className="size-4" />
        </span>
      </CardContent>
    </Card>
  );
}

function EmptyState({ icon: Icon, title, description }: { icon: typeof Activity; title: string; description: string }) {
  return (
    <div className="empty-state flex min-h-40 flex-col items-center justify-center gap-3 px-6 py-8 text-center">
      <span className="grid size-10 place-items-center rounded-xl border border-primary/10 bg-primary/[0.06] text-primary/80"><Icon className="size-5" /></span>
      <div className="space-y-1"><p className="text-sm font-medium text-foreground/85">{title}</p><p className="max-w-md text-xs leading-relaxed text-muted-foreground">{description}</p></div>
    </div>
  );
}

export function MonitoringStrategyPanel({ strategyId }: { strategyId: string }) {
  const token = useApiToken();
  const detail = useQuery({
    queryKey: ["monitoring-strategy", strategyId],
    queryFn: async () => apiGet<Detail>(`/strategies/${strategyId}`, { token: await token() }),
    staleTime: 60_000,
  });
  const trades = useQuery({
    queryKey: ["monitoring-trades", strategyId],
    queryFn: async () => apiGet<Page<Trade>>(`/strategies/${strategyId}/trades?limit=20`, { token: await token() }),
    staleTime: 60_000,
  });
  const equity = useQuery({
    queryKey: ["monitoring-equity", strategyId],
    queryFn: async () => apiGet<Page<Equity>>(`/strategies/${strategyId}/equity?limit=500`, { token: await token() }),
    staleTime: 60_000,
  });

  if (detail.isLoading) {
    return <section className="space-y-4 rounded-2xl border border-white/[0.07] bg-white/[0.015] p-4 sm:p-5" aria-label="Cargando monitoreo de estrategia" aria-busy="true">
      <div className="space-y-2"><Skeleton className="h-5 w-56" /><Skeleton className="h-4 w-80 max-w-full" /></div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>
      <Skeleton className="h-72 rounded-xl" />
    </section>;
  }

  if (detail.isError || !detail.data) {
    return <section role="alert" className="rounded-2xl border border-destructive/20 bg-destructive/[0.045] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-destructive/10 text-destructive"><AlertCircle className="size-4" /></span><div><p className="text-sm font-medium">No se pudo cargar el monitoreo</p><p className="text-xs text-muted-foreground">La vista histórica sigue disponible debajo.</p></div></div><button type="button" onClick={() => void detail.refetch()} className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/10 px-3 text-xs font-medium transition hover:border-primary/30 hover:bg-primary/[0.06]"><RefreshCw className="size-3.5" /> Reintentar</button></div>
    </section>;
  }

  const { metrics: m, positions, position_state: positionState } = detail.data;
  const sampleCount = m?.trade_count ?? 0;
  const rolling = m?.rolling_50;
  const equityRows = equity.data?.items ? [...equity.data.items].reverse() : [];
  const alerts = detail.data.alerts ?? [];

  return (
    <section className="space-y-4 rounded-2xl border border-white/[0.075] bg-gradient-to-br from-white/[0.025] via-transparent to-primary/[0.025] p-4 sm:space-y-5 sm:p-5" aria-labelledby="strategy-monitoring-title">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-white/[0.06] pb-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 grid size-9 place-items-center rounded-xl border border-primary/15 bg-primary/[0.07] text-primary"><Activity className="size-4" /></span>
          <div><h3 id="strategy-monitoring-title" className="text-base font-semibold tracking-tight">Monitoreo en vivo</h3><p className="mt-1 text-xs text-muted-foreground">Rendimiento neto, exposición y calidad de ejecución reportados por el EA.</p></div>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-black/10 px-2.5 py-1 text-[11px] text-muted-foreground"><span className={`size-1.5 rounded-full ${positionState === "fresh" ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.65)]" : "bg-amber-300"}`} />{positionState === "fresh" ? "Snapshot reciente" : positionState === "stale" ? "Snapshot vencido" : "Esperando telemetría"}</div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Metric label="Profit factor live" value={number(m?.profit_factor)} detail={`Últimas 50: ${number(rolling?.profit_factor)} · ${sampleCount} operaciones`} icon={BarChart3} />
        <Metric label="Profit factor OOS" value={number(detail.data.strategy.baselines?.oos_profit_factor)} detail="Baseline OOS configurado" icon={ShieldCheck} />
        <Metric label="Media neta por operación" value={number(m?.average_net_per_trade)} detail={`Media últimos 50: ${number(rolling?.average_net_per_trade)} · T-stat: ${sampleCount >= 20 ? number(m?.t_stat_net_per_trade) : "Sin muestra (<20)"}`} icon={(m?.average_net_per_trade ?? 0) >= 0 ? ArrowUpRight : ArrowDownRight} />
        <Metric label="Frecuencia anualizada" value={number(m?.trades_per_year_live_90d, 1)} detail={`Esperada: ${number(m?.trades_per_year_expected, 1)} · ${m?.frequency_vs_expected_pct == null ? "Sin muestra" : `${number(m.frequency_vs_expected_pct, 1)}% vs. esperada`}`} icon={Activity} />
        <Metric label="Drawdown live / histórico" value={typeof m?.total_dd_pct === "number" ? `${number(m.total_dd_pct)}% / ${number(m.max_dd_pct)}%` : "Sin muestra"} detail={`MC esperado: ${detail.data.strategy.baselines?.mc_expected_max_dd_pct == null ? "Sin muestra" : `${number(detail.data.strategy.baselines.mc_expected_max_dd_pct)}%`}`} icon={ShieldCheck} />
        <Metric label="Win rate" value={typeof m?.win_rate === "number" ? `${number(m.win_rate)}%` : "Sin muestra"} detail={`${sampleCount} operaciones cerradas`} icon={Activity} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Card className="border-white/[0.07] bg-black/[0.08]">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Curva de equity</CardTitle><CardDescription className="text-xs">Muestras cada minuto, ajustadas para depósitos sospechados.</CardDescription></CardHeader>
          <CardContent className="h-64 pt-3">
            {equityRows.length > 1 ? <ResponsiveContainer width="100%" height="100%"><LineChart data={equityRows} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}><CartesianGrid stroke="rgba(255,255,255,.07)" strokeDasharray="3 5" vertical={false} /><XAxis dataKey="ts" hide /><YAxis width={56} tickLine={false} axisLine={false} tick={{ fill: "#8c9b92", fontSize: 10 }} /><Tooltip contentStyle={{ background: "#101914", border: "1px solid rgba(255,255,255,.1)", borderRadius: 12, color: "#edf4ef" }} labelFormatter={(label) => dateTime(String(label))} formatter={(value) => [number(value), "Equity"]} /><Line type="monotone" dataKey="equity" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "hsl(var(--primary))", stroke: "#101914", strokeWidth: 2 }} /></LineChart></ResponsiveContainer> : <EmptyState icon={Activity} title="Construiremos la curva con las siguientes muestras" description={equity.isError ? "No se pudo leer el historial de equity. Reintenta para recuperar las muestras." : "La estrategia todavía no ha enviado suficientes puntos de equity para dibujar una tendencia."} />}
          </CardContent>
        </Card>

        <Card className="border-white/[0.07] bg-black/[0.08]">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Exposición abierta</CardTitle><CardDescription className="text-xs">Posiciones filtradas por el magic number de esta estrategia.</CardDescription></CardHeader>
          <CardContent className="pt-2">
            {positionState !== "fresh" ? <EmptyState icon={BriefcaseBusiness} title={positionState === "stale" ? "El último snapshot ya venció" : "Sin snapshot de posiciones"} description="Se muestra la exposición cuando el EA reporta telemetría reciente. No inferimos una posición plana si falta el dato." /> : positions?.length ? <div className="space-y-2">{positions.map((position) => <div key={position.ticket} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 transition hover:border-primary/15 hover:bg-white/[0.035]"><div className="min-w-0"><div className="flex items-center gap-2"><span className="truncate text-sm font-medium">{position.symbol}</span><span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${position.direction === "long" ? "bg-emerald-400/10 text-emerald-300" : "bg-rose-400/10 text-rose-300"}`}>{position.direction}</span></div><p className="mt-1 text-xs text-muted-foreground">{number(position.volume, 4)} lotes · Entrada {number(position.entry_price)} · Riesgo a SL {position.risk_at_stop == null ? "sin muestra / sin SL" : number(position.risk_at_stop)}</p></div><div className="text-right"><p className={`metric-number text-sm font-semibold tabular-nums ${position.profit + position.swap < 0 ? "text-rose-300" : "text-emerald-300"}`}>{number(position.profit + position.swap)}</p><p className="text-[10px] text-muted-foreground">P&L flotante + swap</p></div></div>)}</div> : <EmptyState icon={ShieldCheck} title="Sin posiciones abiertas" description="El snapshot está actualizado y no reporta posiciones de esta estrategia." />}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <Card className="border-white/[0.07] bg-black/[0.08]">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Operaciones recientes <span className="ml-1 text-xs font-normal text-muted-foreground">({trades.data?.total ?? "—"})</span></CardTitle><CardDescription className="text-xs">Resultados netos reportados al cierre.</CardDescription></CardHeader>
          <CardContent className="overflow-x-auto pt-2">
            {trades.data?.items?.length ? <table className="w-full min-w-[520px] text-left text-xs"><thead className="text-[10px] uppercase tracking-[0.09em] text-muted-foreground"><tr>{["Activo", "Lado", "Entrada UTC", "Salida UTC", "P&L neto"].map((heading) => <th key={heading} className="px-2 py-2 font-medium">{heading}</th>)}</tr></thead><tbody>{trades.data.items.map((trade) => <tr key={trade.id} className="border-t border-white/[0.055] transition hover:bg-white/[0.025]"><td className="px-2 py-2.5 font-medium">{trade.symbol ?? "—"}</td><td className="px-2 py-2.5 capitalize text-muted-foreground">{trade.trade_type ?? "—"}</td><td className="px-2 py-2.5 text-muted-foreground">{dateTime(trade.entry_time)}</td><td className="px-2 py-2.5 text-muted-foreground">{dateTime(trade.exit_time)}</td><td className={`px-2 py-2.5 text-right font-semibold tabular-nums ${(trade.profit ?? 0) < 0 ? "text-rose-300" : "text-emerald-300"}`}>{number(trade.profit)}</td></tr>)}</tbody></table> : <EmptyState icon={BarChart3} title="Aún no hay operaciones normalizadas" description="Las operaciones aparecerán aquí cuando se reciban y validen desde el EA." />}
          </CardContent>
        </Card>

        <Card className="border-white/[0.07] bg-black/[0.08]">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Alertas activas <span className="ml-1 text-xs font-normal text-muted-foreground">({alerts.length})</span></CardTitle><CardDescription className="text-xs">Señales operativas y de salud para revisión.</CardDescription></CardHeader>
          <CardContent className="space-y-2 pt-2">{alerts.length ? alerts.map((alert) => <div key={alert.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.055] bg-white/[0.018] px-3 py-2.5"><span className="min-w-0 truncate text-xs font-medium">{alert.rule_key.replaceAll("_", " ")}</span><span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold uppercase ${alert.severity === "critical" || alert.severity === "high" ? "bg-rose-400/10 text-rose-300" : "bg-amber-300/10 text-amber-200"}`}>{alert.severity ?? "info"}</span></div>) : <EmptyState icon={ShieldCheck} title="Todo despejado" description="No hay alertas abiertas para esta estrategia." />}</CardContent>
        </Card>
      </div>
    </section>
  );
}
