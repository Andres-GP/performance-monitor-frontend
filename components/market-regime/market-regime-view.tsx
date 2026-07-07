"use client";

import {
  Activity,
  ArrowUpDown,
  Gauge,
  Layers,
  Signal,
  TrendingUp,
  Waves,
  Library,
} from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { OfflineBanner } from "@/components/shared/offline-banner";
import { RegimeWidget } from "./regime-widget";
import { useMarketRegime } from "@/lib/queries";
import { formatDate } from "@/lib/format";
import { useI18n } from "@/lib/i18n/context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function MarketRegimeView() {
  const { dict } = useI18n();
  const { data, isLoading } = useMarketRegime();
  const r = data?.data;
  const interpolate = (template: string, value: string | number) =>
    template.replace("{value}", String(value));

  // ---- Explicaciones detalladas de métricas (usando el diccionario) ----
  const metricExplanations = {
    adx: {
      detail: (
        <div className="text-sm leading-relaxed">
          <p className="font-medium">{dict.regime.adxHelpTitle}</p>
          <p>{dict.regime.adxHelpDesc}</p>
          <ul className="mt-1 list-disc pl-4">
            <li>
              <span className="font-semibold">&lt; 20</span> →{" "}
              {dict.regime.adxHelpSideways}
            </li>
            <li>
              <span className="font-semibold">&gt; 25</span> →{" "}
              {dict.regime.adxHelpTrending}
            </li>
            <li>
              <span className="font-semibold">20–25</span> →{" "}
              {dict.regime.adxHelpTransition}
            </li>
          </ul>
          <p className="mt-1">
            <strong>{dict.regime.adxHelpNow}</strong>{" "}
            {r?.trend === "trending" && dict.regime.adxHelpNowTrending}
            {r?.trend === "sideways" && dict.regime.adxHelpNowSideways}
            {r?.trend === "transition" && dict.regime.adxHelpNowTransition}
          </p>
        </div>
      ),
    },
    vix: {
      detail: (
        <div className="text-sm leading-relaxed">
          <p className="font-medium">{dict.regime.vixHelpTitle}</p>
          <p>{dict.regime.vixHelpDesc}</p>
          <ul className="mt-1 list-disc pl-4">
            <li>
              <span className="font-semibold">&gt; 80%</span> →{" "}
              {dict.regime.vixHelpExtremeFear}
            </li>
            <li>
              <span className="font-semibold">&lt; 20%</span> →{" "}
              {dict.regime.vixHelpComplacency}
            </li>
            <li>
              <span className="font-semibold">20% – 80%</span> →{" "}
              {dict.regime.vixHelpNormal}
            </li>
          </ul>
          <p className="mt-1">
            <strong>{dict.regime.vixHelpNow}</strong>{" "}
            {r?.fear === "extreme_fear" && dict.regime.vixHelpNowExtreme}
            {r?.fear === "extreme_complacency" &&
              dict.regime.vixHelpNowComplacency}
            {r?.fear === "normal" && dict.regime.vixHelpNowNormal}
          </p>
        </div>
      ),
    },
    atr: {
      detail: (
        <div className="text-sm leading-relaxed">
          <p className="font-medium">{dict.regime.atrHelpTitle}</p>
          <p>{dict.regime.atrHelpDesc}</p>
          <ul className="mt-1 list-disc pl-4">
            <li>
              <span className="font-semibold">&gt; 70%</span> →{" "}
              {dict.regime.atrHelpHigh}
            </li>
            <li>
              <span className="font-semibold">&lt; 30%</span> →{" "}
              {dict.regime.atrHelpLow}
            </li>
            <li>
              <span className="font-semibold">30% – 70%</span> →{" "}
              {dict.regime.atrHelpNormal}
            </li>
          </ul>
          <p className="mt-1">
            <strong>{dict.regime.atrHelpNow}</strong>{" "}
            {r?.volatility === "high" && dict.regime.atrHelpNowHigh}
            {r?.volatility === "low" && dict.regime.atrHelpNowLow}
            {r?.volatility === "normal" && dict.regime.atrHelpNowNormal}
          </p>
        </div>
      ),
    },
    breadth: {
      detail: (
        <div className="text-sm leading-relaxed">
          <p className="font-medium">{dict.regime.breadthHelpTitle}</p>
          <p>{dict.regime.breadthHelpDesc}</p>
          <ul className="mt-1 list-disc pl-4">
            <li>
              <span className="text-green-400">
                {dict.regime.breadthHelpStrongUpside}
              </span>
            </li>
            <li>
              <span className="text-red-400">
                {dict.regime.breadthHelpStrongDownside}
              </span>
            </li>
            <li>
              <span className="text-gray-400">
                {dict.regime.breadthHelpNeutral}
              </span>
            </li>
          </ul>
          <p className="mt-1">
            <strong>{dict.regime.breadthHelpNow}</strong>{" "}
            {r?.breadth === "strong_upside" && dict.regime.breadthHelpNowUpside}
            {r?.breadth === "strong_downside" &&
              dict.regime.breadthHelpNowDownside}
            {r?.breadth === "neutral" && dict.regime.breadthHelpNowNeutral}
          </p>
        </div>
      ),
    },
    strength: {
      detail: (
        <div className="text-sm leading-relaxed">
          <p className="font-medium">{dict.regime.strengthHelpTitle}</p>
          <p>{dict.regime.strengthHelpDesc}</p>
          <ul className="mt-1 list-disc pl-4">
            <li>
              <span className="text-green-400">
                {dict.regime.strengthHelpStrong}
              </span>
            </li>
            <li>
              <span className="text-red-400">
                {dict.regime.strengthHelpWeak}
              </span>
            </li>
            <li>
              <span className="text-gray-400">
                {dict.regime.strengthHelpNeutral}
              </span>
            </li>
          </ul>
          <p className="mt-1">
            <strong>{dict.regime.strengthHelpNow}</strong>{" "}
            {r?.strength === "strong" && dict.regime.strengthHelpNowStrong}
            {r?.strength === "weak" && dict.regime.strengthHelpNowWeak}
            {r?.strength === "neutral" && dict.regime.strengthHelpNowNeutral}
          </p>
        </div>
      ),
    },
    advDec: {
      detail: (
        <div className="text-sm leading-relaxed">
          <p className="font-medium">{dict.regime.advDecHelpTitle}</p>
          <p>{dict.regime.advDecHelpDesc}</p>
          <ul className="mt-1 list-disc pl-4">
            <li>
              <span className="font-semibold">&gt; 2</span> →{" "}
              <span className="text-green-400">
                {dict.regime.advDecHelpStrong}
              </span>
            </li>
            <li>
              <span className="font-semibold">&lt; 0.5</span> →{" "}
              <span className="text-red-400">{dict.regime.advDecHelpWeak}</span>
            </li>
            <li>
              <span className="font-semibold">≈ 1</span> →{" "}
              {dict.regime.advDecHelpNeutral}
            </li>
          </ul>
          <p className="mt-1">
            <strong>{dict.regime.advDecHelpNow}</strong>{" "}
            {r?.advance_decline_ratio?.toFixed(2)}
            {r?.advance_decline_ratio &&
              r.advance_decline_ratio > 2 &&
              " " + dict.regime.advDecHelpNowStrong}
            {r?.advance_decline_ratio &&
              r.advance_decline_ratio < 0.5 &&
              " " + dict.regime.advDecHelpNowWeak}
            {r?.advance_decline_ratio &&
              r.advance_decline_ratio >= 0.5 &&
              r.advance_decline_ratio <= 2 &&
              " " + dict.regime.advDecHelpNowNeutral}
          </p>
        </div>
      ),
    },
    nhNl: {
      detail: (
        <div className="text-sm leading-relaxed">
          <p className="font-medium">{dict.regime.nhNlHelpTitle}</p>
          <p>{dict.regime.nhNlHelpDesc}</p>
          <ul className="mt-1 list-disc pl-4">
            <li>
              <span className="font-semibold">&gt; 3</span> →{" "}
              <span className="text-green-400">
                {dict.regime.nhNlHelpStrong}
              </span>
            </li>
            <li>
              <span className="font-semibold">&lt; 0.33</span> →{" "}
              <span className="text-red-400">{dict.regime.nhNlHelpWeak}</span>
            </li>
            <li>
              <span className="font-semibold">≈ 1</span> →{" "}
              {dict.regime.nhNlHelpNeutral}
            </li>
          </ul>
          <p className="mt-1">
            <strong>{dict.regime.nhNlHelpNow}</strong>{" "}
            {r?.nh_nl_ratio?.toFixed(2)}
            {r?.nh_nl_ratio &&
              r.nh_nl_ratio > 3 &&
              " " + dict.regime.nhNlHelpNowStrong}
            {r?.nh_nl_ratio &&
              r.nh_nl_ratio < 0.33 &&
              " " + dict.regime.nhNlHelpNowWeak}
            {r?.nh_nl_ratio &&
              r.nh_nl_ratio >= 0.33 &&
              r.nh_nl_ratio <= 3 &&
              " " + dict.regime.nhNlHelpNowNeutral}
          </p>
        </div>
      ),
    },
    corr: {
      detail: (
        <div className="text-sm leading-relaxed">
          <p className="font-medium">{dict.regime.corrHelpTitle}</p>
          <p>{dict.regime.corrHelpDesc}</p>
          <ul className="mt-1 list-disc pl-4">
            <li>
              <span className="font-semibold">SPY vs QQQ</span>:{" "}
              {dict.regime.corrHelpSpyQqq}
            </li>
            <li>
              <span className="font-semibold">SPY vs TLT</span>:{" "}
              {dict.regime.corrHelpSpyTlt}
            </li>
          </ul>
          <p className="mt-1">
            <strong>{dict.regime.corrHelpNow}</strong> SPY-QQQ ={" "}
            {r?.correlation_spy_qqq?.toFixed(2)}
            {r?.correlation_spy_qqq &&
              r.correlation_spy_qqq > 0.5 &&
              " (" + dict.regime.corrHelpNowStrong + ")"}
            {r?.correlation_spy_qqq &&
              r.correlation_spy_qqq < -0.5 &&
              " (" + dict.regime.corrHelpNowStrongNeg + ")"}
            {r?.correlation_spy_qqq &&
              Math.abs(r.correlation_spy_qqq) <= 0.5 &&
              " (" + dict.regime.corrHelpNowWeak + ")"}
            <br />
            SPY-TLT = {r?.correlation_spy_tlt?.toFixed(2)}
            {r?.correlation_spy_tlt &&
              r.correlation_spy_tlt < -0.5 &&
              " (" + dict.regime.corrHelpNowNeg + ")"}
            {r?.correlation_spy_tlt &&
              r.correlation_spy_tlt > 0.5 &&
              " (" + dict.regime.corrHelpNowPos + ")"}
            {r?.correlation_spy_tlt &&
              Math.abs(r.correlation_spy_tlt) <= 0.5 &&
              " (" + dict.regime.corrHelpNowWeak + ")"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {dict.regime.corrHelpNote}
          </p>
        </div>
      ),
    },
  };

  const widgetExplanations = {
    correlations: {
      title: dict.regime.correlationsTitle,
      description: dict.regime.correlationsDesc,
      instruments: dict.regime.correlationsInstruments,
    },
    vix: {
      title: dict.regime.vixTitle,
      description: dict.regime.vixDesc,
      instruments: dict.regime.vixInstruments,
    },
    breadth: {
      title: dict.regime.breadthTitle,
      description: dict.regime.breadthDesc,
      instruments: dict.regime.breadthInstruments,
    },
  };

  const metricItems = [
    {
      key: "adx",
      label: dict.regime.adx,
      value: r?.adx?.toFixed(1),
      hint: r?.trend
        ? interpolate(dict.regime.trend, r.trend)
        : dict.regime.trendStrength,
      icon: Gauge,
    },
    {
      key: "vix",
      label: dict.regime.vixPercentile,
      value: `${r?.vix_percentile?.toFixed(1)}%`,
      hint: r?.fear
        ? interpolate(dict.regime.fear, r.fear)
        : dict.regime.impliedVol,
      icon: Activity,
    },
    {
      key: "atr",
      label: dict.regime.atrPercentile,
      value: `${r?.atr_percentile?.toFixed(1)}%`,
      hint: r?.volatility
        ? interpolate(dict.regime.volatility, r.volatility)
        : dict.regime.averageRange,
      icon: Waves,
    },
    {
      key: "breadth",
      label: dict.regime.breadth,
      value: r?.breadth,
      hint: dict.regime.breadthHint,
      icon: Layers,
    },
    {
      key: "strength",
      label: dict.regime.strength,
      value: r?.strength,
      hint: dict.regime.strengthHint,
      icon: Signal,
    },
    {
      key: "advDec",
      label: dict.regime.advanceDecline,
      value: r?.advance_decline_ratio?.toFixed(2),
      hint: dict.regime.advanceDeclineHint,
      icon: ArrowUpDown,
    },
    {
      key: "nhNl",
      label: dict.regime.newHighsLows,
      value: r?.nh_nl_ratio?.toFixed(2),
      hint: dict.regime.newHighsLowsHint,
      icon: TrendingUp,
    },
    {
      key: "corr",
      label: dict.regime.corrSpyQqq,
      value: r?.correlation_spy_qqq?.toFixed(2),
      hint: interpolate(
        dict.regime.corrSpyTlt,
        r?.correlation_spy_tlt?.toFixed(2) ?? "0.00",
      ),
      icon: Activity,
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold">{dict.regime.title}</h2>
          <p className="text-sm text-muted-foreground">
            {dict.regime.subtitle}
          </p>
        </div>
        {r?.timestamp && (
          <span className="text-xs text-muted-foreground">
            {interpolate(dict.regime.updated, formatDate(r.timestamp))}
          </span>
        )}
      </div>

      {data?.isFallback && <OfflineBanner />}

      {/* Tarjetas de métricas - clickeables para mostrar explicación */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metricItems.map((item) => (
          <Dialog key={item.key}>
            <DialogTrigger asChild>
              <div className="h-full cursor-pointer rounded-lg border border-border/50 transition-all duration-200 hover:bg-muted/30 hover:-translate-y-1 hover:shadow-md hover:border-primary/30">
                <StatCard
                  label={item.label}
                  value={item.value}
                  icon={item.icon}
                  hint={item.hint}
                  loading={isLoading}
                  className="text-left h-full"
                />
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{item.label}</DialogTitle>
              </DialogHeader>
              <DialogDescription className="text-left">
                {metricExplanations[item.key as keyof typeof metricExplanations]
                  ?.detail || <p>No hay explicación disponible.</p>}
              </DialogDescription>
            </DialogContent>
          </Dialog>
        ))}
      </div>

      {/* Widgets de gráficos con botón de ayuda (Dialog) - icono solo en gráficos */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="relative">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="cursor-pointer absolute top-10 right-2 z-10 h-6 w-6 p-0 text-muted-foreground/60 hover:text-muted-foreground"
              >
                <Library className="h-3.5 w-3.5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {widgetExplanations.correlations.title}
                </DialogTitle>
              </DialogHeader>
              <DialogDescription className="text-left">
                <p className="text-sm">
                  {widgetExplanations.correlations.description}
                </p>
                <ul className="mt-2 list-disc pl-4 text-sm">
                  {Object.entries(
                    widgetExplanations.correlations.instruments,
                  ).map(([symbol, desc]) => (
                    <li key={symbol}>
                      <span className="font-mono font-semibold">{symbol}</span>:{" "}
                      {desc}
                    </li>
                  ))}
                </ul>
              </DialogDescription>
            </DialogContent>
          </Dialog>
          <RegimeWidget
            title={dict.regime.widgetCorrTitle}
            description={dict.regime.widgetCorrDesc}
            defaultSymbols="AMEX:SPY, NASDAQ:QQQ, NASDAQ:TLT"
          />
        </div>

        <div className="relative">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="cursor-pointer absolute top-10 right-2 z-10 h-6 w-6 p-0 text-muted-foreground/60 hover:text-muted-foreground"
              >
                <Library className="h-3.5 w-3.5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{widgetExplanations.vix.title}</DialogTitle>
              </DialogHeader>
              <DialogDescription className="text-left">
                <p className="text-sm">{widgetExplanations.vix.description}</p>
                <ul className="mt-2 list-disc pl-4 text-sm">
                  {Object.entries(widgetExplanations.vix.instruments).map(
                    ([symbol, desc]) => (
                      <li key={symbol}>
                        <span className="font-mono font-semibold">
                          {symbol}
                        </span>
                        : {desc}
                      </li>
                    ),
                  )}
                </ul>
              </DialogDescription>
            </DialogContent>
          </Dialog>
          <RegimeWidget
            title={dict.regime.widgetVixTitle}
            description={dict.regime.widgetVixDesc}
            defaultSymbols="VIX"
          />
        </div>
      </div>
      <div className="relative">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="cursor-pointer absolute top-10 right-2 z-10 h-6 w-6 p-0 text-muted-foreground/60 hover:text-muted-foreground"
            >
              <Library className="h-3.5 w-3.5" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{widgetExplanations.breadth.title}</DialogTitle>
            </DialogHeader>
            <DialogDescription className="text-left">
              <p className="text-sm">
                {widgetExplanations.breadth.description}
              </p>
              <ul className="mt-2 list-disc pl-4 text-sm">
                {Object.entries(widgetExplanations.breadth.instruments).map(
                  ([symbol, desc]) => (
                    <li key={symbol}>
                      <span className="font-mono font-semibold">{symbol}</span>:{" "}
                      {desc}
                    </li>
                  ),
                )}
              </ul>
            </DialogDescription>
          </DialogContent>
        </Dialog>
        <RegimeWidget
          title={dict.regime.widgetNhnlTitle}
          description={dict.regime.widgetNhnlDesc}
          defaultSymbols="AMEX:SPY, USI:ADVN.NY, USI:DECL.NQ"
          height={420}
        />
      </div>
    </div>
  );
}
