"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, CircleHelp } from "lucide-react";
import { apiGet } from "@/lib/api-client";
import { useApiToken } from "@/lib/queries";
import { useI18n } from "@/lib/i18n/context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bar, BarChart, CartesianGrid, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

type Strategy = {
  strategy_id: string; portfolio_id?: string; backtest_state: string; regime_state: string; ehi: number | null;
  expected_mode?: "demo" | "live"; current_mode?: "demo" | "live" | null; mode_status?: string; mode_observed_at?: string | null;
  ehi_band?: string; ehi_status?: string; ehi_components?: { backtest_percentile?: number | null; regime_score?: number | null };
  ehi_component_states?: { regime?: string }; regime_analysis?: { current_regime?: { trend?: string; direction?: string; volatility?: string; price?: string } };
  backtest_analysis?: { windows?: { last_50_trades?: { percentiles?: { expectancy_pct?: number; profit_factor?: number; win_rate?: number } } } };
};
type Review = { state: string; signals?: string[] };
type Report = { week: string; generated_at?: string; worst_ehi?: number | null; market_data_warning?: string;
  review?: { status: string; strategies?: Array<Review & { strategy_id: string }> }; strategies?: Strategy[] };

const bandClass: Record<string, string> = { RED: "bg-red-100 text-red-800", AMBER: "bg-amber-100 text-amber-900", GREEN: "bg-emerald-100 text-emerald-900" };

export function WeeklyReviewDashboard() {
  const getToken = useApiToken();
  const { dict } = useI18n();
  const t = dict.weeklyReview;
  const query = useQuery({ queryKey: ["weekly-review-latest"], queryFn: async () => apiGet<Report>("/weekly/reports/latest", { token: await getToken() }), staleTime: 60_000 });
  const report = query.data;
  const strategies = report?.strategies ?? [];
  const reviews = new Map((report?.review?.strategies ?? []).map((item) => [item.strategy_id, item]));
  const chartRows = strategies.filter((item) => typeof item.ehi === "number").map((item) => ({ strategy: item.strategy_id, EHI: item.ehi as number }));

  return <section className="space-y-5">
    <header><h1 className="text-2xl font-semibold">{t.title}</h1><p className="text-sm text-muted-foreground">{t.subtitle}</p></header>
    {query.isLoading && <p className="text-sm text-muted-foreground">{t.loading}</p>}
    {query.isError && <div role="alert" className="flex flex-wrap items-center gap-3 text-sm text-destructive"><p>{t.error}</p><button type="button" className="underline underline-offset-4" onClick={() => query.refetch()}>{t.retry}</button></div>}
    {!query.isLoading && !query.isError && !report && <p className="text-sm text-muted-foreground">{t.unavailable}</p>}
    {report && <><div className="grid gap-3 sm:grid-cols-3">
      <Card><CardHeader className="pb-2"><CardTitle className="text-sm">{t.week}</CardTitle></CardHeader><CardContent className="text-xl font-semibold">{report.week}</CardContent></Card>
      <Card><CardHeader className="pb-2"><CardTitle className="text-sm">{t.overall}</CardTitle></CardHeader><CardContent><Badge variant="outline">{report.review?.status ?? "—"}</Badge><p className="mt-2 text-xs text-muted-foreground">{report.generated_at ? `${t.generated}: ${new Date(report.generated_at).toLocaleString()}` : t.noData}</p></CardContent></Card>
      <Card><CardHeader className="pb-2"><CardTitle className="text-sm">{t.worstEhi}</CardTitle></CardHeader><CardContent className="text-xl font-semibold">{report.worst_ehi ?? t.noData}</CardContent></Card>
    </div>
      <p className="rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground">{t.provisional}</p>
      {report.market_data_warning && <p className="rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground">{report.market_data_warning}</p>}
    <div className="grid gap-4 lg:grid-cols-2">
      <Card><CardHeader><CardTitle className="text-base">{t.ehi} — {report.week}</CardTitle></CardHeader><CardContent className="h-72">{chartRows.length ? <ResponsiveContainer width="100%" height="100%"><BarChart data={chartRows} margin={{ bottom: 28 }}><CartesianGrid strokeDasharray="3 3"/><ReferenceArea y1={0} y2={30} fill="#ef4444" fillOpacity={0.08}/><ReferenceArea y1={30} y2={70} fill="#f59e0b" fillOpacity={0.08}/><ReferenceArea y1={70} y2={100} fill="#10b981" fillOpacity={0.08}/><XAxis dataKey="strategy" angle={-20} textAnchor="end" interval={0} height={54}/><YAxis domain={[0, 100]}/><Tooltip/><Bar dataKey="EHI" fill="#2563eb" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer> : <p className="text-sm text-muted-foreground">{t.noData}</p>}</CardContent></Card>
      <Card><CardHeader><CardTitle className="text-base">{t.strategies}</CardTitle></CardHeader><CardContent className="space-y-3">{strategies.length === 0 ? <p className="text-sm text-muted-foreground">{t.noData}</p> : strategies.map((strategy) => { const review = reviews.get(strategy.strategy_id); const status = review?.state ?? strategy.ehi_status ?? strategy.backtest_state; const icon = status === "REVIEW_REQUIRED" ? <AlertTriangle className="size-4 text-amber-600"/> : status === "READY_FOR_HUMAN_REVIEW" ? <CheckCircle2 className="size-4 text-emerald-600"/> : <CircleHelp className="size-4 text-muted-foreground"/>; return <article key={strategy.strategy_id} className="rounded-lg border p-3">
        <div className="flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2">{icon}<b>{strategy.strategy_id}</b></div><Badge className={bandClass[strategy.ehi_band ?? ""] ?? ""}>{typeof strategy.ehi !== "number" ? t.noData : `${strategy.ehi} · ${strategy.ehi_band ?? t.noData}`}</Badge></div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4"><span>{t.portfolio}: {strategy.portfolio_id ?? t.noData}</span><span>{t.accountMode}: {strategy.current_mode === "demo" ? t.demo : strategy.current_mode === "live" ? t.realCapital : `${t.modeUnconfirmed} · ${strategy.expected_mode === "demo" ? t.demo : strategy.expected_mode === "live" ? t.realCapital : "—"}`}{strategy.mode_observed_at ? ` · ${t.modeObservedAt}: ${new Date(strategy.mode_observed_at).toLocaleString()}` : ""}</span><span>{t.state}: {status}</span><span>{t.backtest}: {strategy.backtest_state}</span><span>{t.regime}: {strategy.regime_state}</span><span>{t.regimeScore}: {strategy.ehi_components?.regime_score ?? t.noData}</span></div>
        <p className="mt-2 text-xs text-muted-foreground">{t.expectancy}: {strategy.backtest_analysis?.windows?.last_50_trades?.percentiles?.expectancy_pct ?? t.noData} · {t.profitFactor}: {strategy.backtest_analysis?.windows?.last_50_trades?.percentiles?.profit_factor ?? t.noData} · {t.winRate}: {strategy.backtest_analysis?.windows?.last_50_trades?.percentiles?.win_rate ?? t.noData}</p>
        {strategy.ehi_status === "PROVISIONAL" && <p className="mt-2 text-xs">{t.provisional}</p>}
        {strategy.ehi_component_states?.regime === "HYPOTHESIS_UNCONFIRMED_NEUTRAL" && <p className="mt-1 text-xs text-muted-foreground">{t.unconfirmed}</p>}
        {strategy.regime_analysis?.current_regime && <p className="mt-1 text-xs text-muted-foreground">{t.market}: {Object.values(strategy.regime_analysis.current_regime).join(" · ")}</p>}
        {!!review?.signals?.length && <p className="mt-1 text-xs text-amber-800">{review.signals.join(" · ")}</p>}
      </article>; })}</CardContent></Card>
    </div></>}
  </section>;
}
