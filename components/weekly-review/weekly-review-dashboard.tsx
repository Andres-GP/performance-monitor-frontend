"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, CircleHelp, RefreshCw } from "lucide-react";
import { getWithFallback } from "@/lib/api-client";
import { useApiToken } from "@/lib/queries";
import { useI18n } from "@/lib/i18n/context";
import { OfflineBanner } from "@/components/shared/offline-banner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bar, BarChart, CartesianGrid, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

type Strategy = {
  strategy_id: string; portfolio_id?: string; backtest_state: string; regime_state: string; ehi: number | null;
  expected_mode?: "demo" | "live"; current_mode?: "demo" | "live" | null; mode_status?: string; mode_observed_at?: string | null;
  ehi_band?: string; ehi_status?: string; ehi_components?: { backtest_percentile?: number | null; regime_score?: number | null };
  ehi_component_states?: { regime?: string }; regime_analysis?: { current_regime?: { trend?: string; direction?: string; volatility?: string; price?: string } };
  note?: string; backtest_analysis?: { windows?: { last_50_trades?: { verdict?: string | null; percentiles?: { expectancy_pct?: number | null; profit_factor?: number | null; win_rate?: number | null } } } };
};
type Review = { state: string; signals?: string[]; limitations?: string[]; backtest_verdict?: string | null; regime_status?: string | null; regime_hypothesis_confirmed?: boolean };
type Report = { week: string; generated_at?: string; worst_ehi?: number | null; market_data_warning?: string;
  review?: { status: string; strategies?: Array<Review & { strategy_id: string }> }; strategies?: Strategy[] };

const bandClass: Record<string, string> = { RED: "border-red-300/15 bg-red-400/10 text-red-200", AMBER: "border-amber-300/15 bg-amber-300/10 text-amber-100", GREEN: "border-emerald-300/15 bg-emerald-300/10 text-emerald-100" };

export function WeeklyReviewDashboard() {
  const getToken = useApiToken();
  const { dict } = useI18n();
  const t = dict.weeklyReview;
  const query = useQuery({ queryKey: ["weekly-review-latest"], queryFn: async ({ signal }) => getWithFallback<Report>("/weekly/reports/latest", { signal, token: await getToken(), emptyOnNotFound: true }), staleTime: 60_000 });
  const retry = () => {
    void query.refetch({ cancelRefetch: true, throwOnError: false });
  };
  const report = query.data?.data;
  const strategies = report?.strategies ?? [];
  const reviews = new Map((report?.review?.strategies ?? []).map((item) => [item.strategy_id, item]));
  const chartRows = strategies.filter((item) => typeof item.ehi === "number").map((item) => ({ strategy: item.strategy_id, EHI: item.ehi as number }));

  return <section className="space-y-5">
    <header className="border-b border-white/[0.06] pb-4"><h1 className="text-2xl font-semibold tracking-tight">{t.title}</h1><p className="mt-1 text-sm text-muted-foreground">{t.subtitle}</p></header>
    {query.isLoading && <div className="space-y-4" aria-live="polite" aria-busy="true"><span className="sr-only">{t.loading}</span><div className="grid gap-3 sm:grid-cols-3">{Array.from({ length: 3 }, (_, index) => <Skeleton key={index} className="h-24 rounded-xl" />)}</div><Skeleton className="h-72 rounded-xl" /></div>}
    {query.isError && <div role="alert" className="notice-error flex flex-wrap items-center justify-between gap-3 text-sm text-destructive"><p>{t.error}</p><RetryButton pending={query.isFetching} onClick={retry} label={t.retry} pendingLabel={t.loading} /></div>}
    {query.data?.isFallback && !query.isError && <div className="notice-warning flex flex-wrap items-center justify-between gap-3" aria-busy={query.isFetching}><OfflineBanner /><RetryButton pending={query.isFetching} onClick={retry} label={t.retry} pendingLabel={t.loading} /></div>}
    {!query.isLoading && !query.isError && !report && <div className="empty-state px-6 py-14 text-center text-sm text-muted-foreground"><div className="relative z-[1] mx-auto flex max-w-sm flex-col items-center gap-4"><span className="flex size-11 items-center justify-center rounded-xl border border-primary/10 bg-primary/[0.06] text-primary/80"><CircleHelp className="size-5" /></span><p>{t.unavailable}</p><RetryButton pending={query.isFetching} onClick={retry} label={t.retry} pendingLabel={t.loading} /></div></div>}
    {report && <><div className="grid gap-3 sm:grid-cols-3">
      <Card><CardHeader className="pb-2"><CardTitle className="text-sm">{t.week}</CardTitle></CardHeader><CardContent className="text-xl font-semibold">{report.week}</CardContent></Card>
      <Card><CardHeader className="pb-2"><CardTitle className="text-sm">{t.overall}</CardTitle></CardHeader><CardContent><Badge variant="outline">{report.review?.status ?? "—"}</Badge><p className="mt-2 text-xs text-muted-foreground">{report.generated_at ? `${t.generated}: ${new Date(report.generated_at).toLocaleString()}` : t.noData}</p></CardContent></Card>
      <Card><CardHeader className="pb-2"><CardTitle className="text-sm">{t.worstEhi}</CardTitle></CardHeader><CardContent className="text-xl font-semibold">{report.worst_ehi ?? t.noData}</CardContent></Card>
    </div>
      <p className="rounded-xl border border-primary/10 bg-primary/[0.035] p-3.5 text-xs leading-relaxed text-muted-foreground">{t.provisional}</p>
      {report.market_data_warning && <p className="rounded-xl border border-amber-200/10 bg-amber-200/[0.035] p-3.5 text-xs leading-relaxed text-muted-foreground">{report.market_data_warning}</p>}
    <div className="grid gap-4 lg:grid-cols-2">
      <Card><CardHeader><CardTitle className="text-base">{t.ehi} — {report.week}</CardTitle></CardHeader><CardContent className="h-72">{chartRows.length ? <ResponsiveContainer width="100%" height="100%"><BarChart data={chartRows} margin={{ bottom: 28 }}><CartesianGrid strokeDasharray="3 3"/><ReferenceArea y1={0} y2={30} fill="#ec7469" fillOpacity={0.07}/><ReferenceArea y1={30} y2={70} fill="#e5bd73" fillOpacity={0.07}/><ReferenceArea y1={70} y2={100} fill="#79c8aa" fillOpacity={0.07}/><XAxis dataKey="strategy" angle={-20} textAnchor="end" interval={0} height={54}/><YAxis domain={[0, 100]}/><Tooltip/><Bar dataKey="EHI" fill="var(--color-chart-1)" radius={[5,5,0,0]}/></BarChart></ResponsiveContainer> : <div className="chart-empty h-full text-sm">{t.noData}</div>}</CardContent></Card>
      <Card><CardHeader><CardTitle className="text-base">{t.strategies}</CardTitle></CardHeader><CardContent className="space-y-3">{strategies.length === 0 ? <div className="chart-empty text-sm">{t.noData}</div> : strategies.map((strategy) => { const review = reviews.get(strategy.strategy_id); const status = review?.state ?? strategy.ehi_status ?? strategy.backtest_state; const icon = status === "REVIEW_REQUIRED" ? <AlertTriangle className="size-4 text-amber-300"/> : status === "READY_FOR_HUMAN_REVIEW" ? <CheckCircle2 className="size-4 text-emerald-300"/> : <CircleHelp className="size-4 text-muted-foreground"/>; return <article key={strategy.strategy_id} className="rounded-xl border border-white/[0.07] bg-white/[0.018] p-4 transition-colors hover:border-white/[0.12] hover:bg-white/[0.03]">
        <div className="flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2">{icon}<b>{strategy.strategy_id}</b></div><Badge className={bandClass[strategy.ehi_band ?? ""] ?? ""}>{typeof strategy.ehi !== "number" ? t.noData : `${strategy.ehi} · ${strategy.ehi_band ?? t.noData}`}</Badge></div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4"><span>{t.portfolio}: {strategy.portfolio_id ?? t.noData}</span><span>{t.accountMode}: {strategy.current_mode === "demo" ? t.demo : strategy.current_mode === "live" ? t.realCapital : `${t.modeUnconfirmed} · ${strategy.expected_mode === "demo" ? t.demo : strategy.expected_mode === "live" ? t.realCapital : "—"}`}{strategy.mode_observed_at ? ` · ${t.modeObservedAt}: ${new Date(strategy.mode_observed_at).toLocaleString()}` : ""}</span><span>{t.state}: {status}</span><span>{t.backtest}: {strategy.backtest_state}</span><span>{t.verdict}: {review?.backtest_verdict ?? strategy.backtest_analysis?.windows?.last_50_trades?.verdict ?? t.noData}</span><span>{t.regime}: {review?.regime_status ?? strategy.regime_state}</span><span>{t.regimeScore}: {strategy.ehi_components?.regime_score ?? t.noData}</span></div>
        <p className="mt-2 text-xs text-muted-foreground">{t.expectancy}: {strategy.backtest_analysis?.windows?.last_50_trades?.percentiles?.expectancy_pct ?? t.noData} · {t.profitFactor}: {strategy.backtest_analysis?.windows?.last_50_trades?.percentiles?.profit_factor ?? t.noData} · {t.winRate}: {strategy.backtest_analysis?.windows?.last_50_trades?.percentiles?.win_rate ?? t.noData}</p>
        {strategy.ehi_status === "PROVISIONAL" && <p className="mt-2 text-xs">{t.provisional}</p>}
        {strategy.ehi_component_states?.regime === "HYPOTHESIS_UNCONFIRMED_NEUTRAL" && <p className="mt-1 text-xs text-muted-foreground">{t.unconfirmed}</p>}
        {!!review?.limitations?.length && <p className="mt-1 text-xs text-muted-foreground">{t.limitations}: {review.limitations.join(" · ")}</p>}
        {strategy.regime_analysis?.current_regime && <p className="mt-1 text-xs text-muted-foreground">{t.market}: {Object.values(strategy.regime_analysis.current_regime).join(" · ")}</p>}
        {strategy.note && <p className="mt-1 text-xs text-muted-foreground">{t.note}: {strategy.note}</p>}
        {!!review?.signals?.length && <p className="mt-1 text-xs text-[#c8f5a8]">{t.signals}: {review.signals.join(" · ")}</p>}
      </article>; })}</CardContent></Card>
    </div></>}
  </section>;
}

function RetryButton({ pending, onClick, label, pendingLabel }: { pending: boolean; onClick: () => void; label: string; pendingLabel: string }) {
  return (
    <Button type="button" variant="outline" size="sm" className="weekly-retry" onClick={onClick} disabled={pending} aria-busy={pending}>
      <RefreshCw aria-hidden="true" className={`size-3.5 ${pending ? "animate-spin motion-reduce:animate-none" : ""}`} />
      <span>{pending ? pendingLabel : label}</span>
    </Button>
  );
}
