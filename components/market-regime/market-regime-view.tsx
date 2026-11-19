"use client";

import { Activity, ArrowDownUp, Clock3, Waves } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { OfflineBanner } from "@/components/shared/offline-banner";
import { formatNumber } from "@/lib/format";
import { useI18n } from "@/lib/i18n/context";
import { useMarketRegime } from "@/lib/queries";
import type { MarketRegime } from "@/types";

function MetricCard({
  label,
  value,
  unit,
  description,
}: {
  label: string;
  value: number | null | undefined;
  unit?: string;
  description: string;
}) {
  const { dict } = useI18n();
  const available = typeof value === "number" && Number.isFinite(value);

  return (
    <Card className="min-h-36">
      <CardContent className="flex h-full flex-col p-5">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="mt-4 flex items-baseline gap-2 font-mono text-3xl font-semibold tracking-tight tabular-nums">
          {available ? formatNumber(value) : dict.common.none}
          {available && unit ? (
            <span className="font-sans text-xs font-medium text-muted-foreground">
              {unit}
            </span>
          ) : null}
        </p>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

function ContextPill({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex min-w-36 flex-1 flex-col gap-2 rounded-xl border border-white/10 bg-[#1f3d36]/70 p-4">
      <span className="text-xs font-medium uppercase tracking-[0.14em] text-[#adc5b7]">
        {label}
      </span>
      <span className="text-lg font-semibold capitalize text-[#f2f5ef]">
        {value || "—"}
      </span>
    </div>
  );
}

export function MarketRegimeView() {
  const { dict, locale } = useI18n();
  const query = useMarketRegime();
  const payload = query.data;
  const regime: MarketRegime | null | undefined = payload?.data;
  const dateLocale = locale === "es" ? "es-ES" : "en-US";

  const cards = [
    {
      label: dict.regime.adx,
      value: regime?.adx,
      unit: dict.regime.indexUnit,
      description: dict.regime.adxHelpDesc,
    },
    {
      label: dict.regime.vixPercentile,
      value: regime?.vix_percentile,
      unit: "%",
      description: dict.regime.vixHelpDesc,
    },
    {
      label: dict.regime.atrPercentile,
      value: regime?.atr_percentile,
      unit: "%",
      description: dict.regime.atrHelpDesc,
    },
    {
      label: dict.regime.breadth,
      value: regime?.breadth,
      description: dict.regime.breadthHelpDesc,
    },
    {
      label: dict.regime.strength,
      value: regime?.strength,
      description: dict.regime.strengthHelpDesc,
    },
    {
      label: dict.regime.advanceDecline,
      value: regime?.advance_decline_ratio,
      unit: dict.regime.ratioUnit,
      description: dict.regime.advDecHelpDesc,
    },
    {
      label: dict.regime.newHighsLows,
      value: regime?.nh_nl_ratio,
      unit: dict.regime.ratioUnit,
      description: dict.regime.nhNlHelpDesc,
    },
    {
      label: dict.regime.corrSpyQqq,
      value: regime?.correlation_spy_qqq,
      unit: dict.regime.correlationUnit,
      description: dict.regime.corrHelpDesc,
    },
    {
      label: dict.regime.corrSpyTlt,
      value: regime?.correlation_spy_tlt,
      unit: dict.regime.correlationUnit,
      description: dict.regime.corrHelpDesc,
    },
  ];

  return (
    <section className="mx-auto flex w-full max-w-[1500px] flex-col gap-7" aria-labelledby="market-regime-title">
      <header className="relative overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(120deg,#2b4d44_0%,#1f3d36_66%,#27473e_100%)] px-6 py-7 shadow-[0_22px_60px_rgba(7,25,20,0.22)] md:px-9 md:py-9">
        <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-20 size-72 rounded-full border border-[#c8f5a8]/10" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-1 top-0 size-52 rounded-full border border-dashed border-[#c8f5a8]/10" />
        <div className="relative max-w-3xl">
          <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#c8f5a8]">
            <span className="h-px w-6 bg-current" />
            {dict.regime.marketContext}
          </p>
          <h1 id="market-regime-title" className="text-3xl font-semibold tracking-tight text-[#f2f5ef] md:text-4xl">
            {dict.regime.title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#d1ddd5] md:text-base">
            {dict.regime.subtitle}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <ContextPill label={dict.regime.trendLabel} value={regime?.trend} />
            <ContextPill label={dict.regime.fearLabel} value={regime?.fear} />
            <ContextPill label={dict.regime.volatilityLabel} value={regime?.volatility} />
          </div>
          <p className="mt-5 flex items-center gap-2 text-xs text-[#adc5b7]" aria-live="polite">
            <Clock3 aria-hidden="true" className="size-3.5" />
            {regime?.timestamp
              ? dict.regime.updated.replace(
                  "{value}",
                  new Date(regime.timestamp).toLocaleString(dateLocale),
                )
              : dict.regime.noTimestamp}
          </p>
        </div>
      </header>

      {payload?.isFallback ? <OfflineBanner /> : null}

      {query.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label={dict.regime.loading}>
          {Array.from({ length: 9 }, (_, index) => (
            <Skeleton key={index} className="h-36 rounded-2xl" />
          ))}
        </div>
      ) : query.isError ? (
        <div role="alert" className="flex flex-wrap items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">
          <span>{dict.regime.loadError}</span>
          <button type="button" className="font-medium underline underline-offset-4" onClick={() => query.refetch()}>
            {dict.regime.retry}
          </button>
        </div>
      ) : !regime ? (
        <Card>
          <CardContent className="flex min-h-36 items-center gap-3 p-6 text-sm text-muted-foreground">
            <Waves aria-hidden="true" className="size-5 shrink-0 text-primary" />
            {dict.regime.empty}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <Activity aria-hidden="true" className="size-4 text-primary" />
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {dict.regime.marketIndicators}
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {cards.map((card) => (
              <MetricCard key={card.label} {...card} />
            ))}
          </div>
          <aside className="flex items-start gap-3 rounded-xl border border-[#c8f5a8]/15 bg-[#2b4d44]/55 p-4 text-sm leading-relaxed text-[#c4d3c9]">
            <ArrowDownUp aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[#c8f5a8]" />
            <p>{dict.regime.brokerDataNote}</p>
          </aside>
        </>
      )}
    </section>
  );
}
