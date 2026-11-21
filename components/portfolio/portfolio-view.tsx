"use client";

import { useState, type KeyboardEvent } from "react";
import { MonitoringPortfolioDashboard } from "./monitoring-dashboard";
import { Activity, Edit, Receipt, TrendingDown, Library } from "lucide-react";
import { WeightsBar } from "@/components/charts/lazy";
import { CorrelationHeatmap } from "@/components/charts/correlation-heatmap";
import { StatCard } from "@/components/shared/stat-card";
import { OfflineBanner } from "@/components/shared/offline-banner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  usePortfolioMetrics,
  usePortfolioWeights,
  useSetWeight,
} from "@/lib/queries";
import { formatCurrency, formatNumber, formatPercentPoints } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";
import { toast } from "sonner";

export function PortfolioView() {
  const { dict } = useI18n();

  const weights = usePortfolioWeights();
  const metrics = usePortfolioMetrics();
  const setWeight = useSetWeight();

  const isFallback = weights.data?.isFallback || metrics.data?.isFallback;
  const weightList = weights.data?.data ?? [];
  const pm = metrics.data?.data;

  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [helpContent, setHelpContent] = useState<{
    title: string;
    description: string;
  }>({ title: "", description: "" });

  const openHelp = (titleKey: string, descKey: string) => {
    setHelpContent({
      title: dict.portfolio[titleKey as keyof typeof dict.portfolio] as string,
      description: dict.portfolio[
        descKey as keyof typeof dict.portfolio
      ] as string,
    });
    setHelpDialogOpen(true);
  };

  const openHelpFromKeyboard = (event: KeyboardEvent<HTMLDivElement>, titleKey: string, descKey: string) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openHelp(titleKey, descKey);
    }
  };

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editableWeights, setEditableWeights] = useState<
    { strategy_id: string; strategy_name: string; target_weight: string }[]
  >([]);

  const handleWeightChange = (index: number, value: string) => {
    setEditableWeights((current) => current.map((weight, weightIndex) =>
      weightIndex === index ? { ...weight, target_weight: value } : weight,
    ));
  };

  const parsedWeights = editableWeights.map((weight) => Number(weight.target_weight));
  const totalWeight = parsedWeights.reduce(
    (sum, weight) => sum + (Number.isFinite(weight) ? weight : 0),
    0,
  );
  const isWeightSumValid = parsedWeights.length > 0 &&
    parsedWeights.every((weight, index) => editableWeights[index].target_weight.trim() !== "" && Number.isFinite(weight) && weight >= 0 && weight <= 100) &&
    Math.abs(totalWeight - 100) < 0.01;

  const handleSaveWeights = async () => {
    if (!isWeightSumValid) {
      toast.error(dict.portfolio.weightSumError);
      return;
    }

    const promises = editableWeights.map((w) =>
      setWeight.mutateAsync({
        strategy_id: w.strategy_id,
        target_weight: Number(w.target_weight),
      }),
    );

    const results = await Promise.allSettled(promises);
    if (results.some((result) => result.status === "rejected")) {
      toast.error(dict.portfolio.weightsSaveError);
      await Promise.all([weights.refetch(), metrics.refetch()]);
      return;
    }
    setEditDialogOpen(false);
  };

  const allocationDeviations = pm?.allocation_deviations ?? {};
  const concentrationMetrics = pm?.concentration_metrics ?? {};
  const pnlMix = Object.entries(pm?.exposure_by_category ?? {})
    .filter(([, value]) => Number.isFinite(value))
    .sort((left, right) => right[1] - left[1]);

  const maxConcentration = Object.entries(concentrationMetrics).reduce(
    (max, [category, pct]) => {
      if (pct > max.value) {
        return { category, value: pct };
      }
      return max;
    },
    { category: "", value: 0 },
  );

  const weightsData = weightList.map((w) => {
    const actual = allocationDeviations[w.strategy_id]?.actual ?? null;
    return {
      strategy_id: w.strategy_id,
      strategy_name: w.strategy_name ?? w.strategy_id,
      target_weight: w.target_weight ?? 0,
      actual_weight: actual,
    };
  });

  const deviationData = Object.entries(allocationDeviations).map(
    ([strategyId, data]) => ({
      strategyId,
      target: data.target,
      actual: data.actual,
      deviation: data.deviation,
    }),
  );

  const correlationMatrix = pm?.correlation_matrix;
  const correlationEntries =
    correlationMatrix && !("note" in correlationMatrix)
      ? Object.entries(correlationMatrix)
      : [];
  const hasCorrelation = correlationEntries.length > 0;

  let heatmapStrategies: string[] = [];
  let heatmapMatrix: (number | null)[][] = [];

  if (hasCorrelation) {
    heatmapStrategies = correlationEntries.map(([strategyId]) => strategyId);
    heatmapMatrix = correlationEntries.map(([, row]) =>
      heatmapStrategies.map((strategyId) => row[strategyId] ?? null),
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{dict.portfolio.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
          {dict.portfolio.subtitle}
        </p>
      </div>

      <MonitoringPortfolioDashboard />

      {isFallback && <OfflineBanner />}
      {(weights.isError || metrics.isError) && (
        <div role="alert" className="notice-error flex flex-wrap items-center gap-3 text-sm text-destructive">
          <span>{dict.portfolio.monitoringError}</span>
          <button type="button" className="font-medium underline underline-offset-4" onClick={() => { void weights.refetch(); void metrics.refetch(); }}>
            {dict.portfolio.retry}
          </button>
        </div>
      )}
      {!metrics.isLoading && !metrics.isError && !metrics.data?.isFallback && !pm && (
        <p role="status" className="rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm text-muted-foreground">
          {dict.portfolio.metricsUnavailable}
        </p>
      )}

      <div className="flex flex-wrap gap-4">
        <div
          role="button"
          tabIndex={0}
          aria-label={dict.portfolio.helpSharpeTitle}
          onKeyDown={(event) => openHelpFromKeyboard(event, "helpSharpeTitle", "helpSharpeDesc")}
          className="metric-tile flex-1 min-w-[180px] lg:flex-[1_1_calc(33.333%-1rem)] h-full cursor-pointer rounded-xl transition-all duration-200"
          onClick={() => openHelp("helpSharpeTitle", "helpSharpeDesc")}
        >
          <StatCard
            label={dict.portfolio.portfolioSharpe}
            value={formatNumber(pm?.sharpe)}
            icon={Activity}
            hint={dict.portfolio.portfolioSharpeHint}
            trend="up"
            loading={metrics.isLoading}
            className="text-left h-full"
          />
        </div>

        <div
          role="button"
          tabIndex={0}
          aria-label={dict.portfolio.helpDrawdownTitle}
          onKeyDown={(event) => openHelpFromKeyboard(event, "helpDrawdownTitle", "helpDrawdownDesc")}
          className="metric-tile flex-1 min-w-[180px] lg:flex-[1_1_calc(33.333%-1rem)] h-full cursor-pointer rounded-xl transition-all duration-200"
          onClick={() => openHelp("helpDrawdownTitle", "helpDrawdownDesc")}
        >
          <StatCard
            label={dict.portfolio.combinedDrawdown}
            value={formatPercentPoints(pm?.max_drawdown)}
            icon={TrendingDown}
            hint={dict.portfolio.combinedDrawdownHint}
            trend="down"
            loading={metrics.isLoading}
            className="text-left h-full"
          />
        </div>

        <div
          role="button"
          tabIndex={0}
          aria-label={dict.portfolio.helpTransactionCostsTitle}
          onKeyDown={(event) => openHelpFromKeyboard(event, "helpTransactionCostsTitle", "helpTransactionCostsDesc")}
          className="metric-tile flex-1 min-w-[180px] lg:flex-[1_1_calc(33.333%-1rem)] h-full cursor-pointer rounded-xl transition-all duration-200"
          onClick={() =>
            openHelp("helpTransactionCostsTitle", "helpTransactionCostsDesc")
          }
        >
          <StatCard
            label={dict.portfolio.transactionCosts}
            value={formatPercentPoints(pm?.transaction_cost_pct)}
            icon={Receipt}
            hint={dict.portfolio.transactionCostsHint}
            loading={metrics.isLoading}
            className="text-left h-full"
          />
        </div>

        <div
          role="button"
          tabIndex={0}
          aria-label={dict.portfolio.helpRuinTitle}
          onKeyDown={(event) => openHelpFromKeyboard(event, "helpRuinTitle", "helpRuinDesc")}
          className="metric-tile flex-1 min-w-[180px] lg:flex-[1_1_calc(50%-0.5rem)] h-full cursor-pointer rounded-xl transition-all duration-200"
          onClick={() => openHelp("helpRuinTitle", "helpRuinDesc")}
        >
          <StatCard
            label={dict.portfolio.ruinProbability}
            value={formatPercentPoints(pm?.ruin_probability)}
            icon={Activity}
            hint={dict.portfolio.ruinProbabilityHint}
            loading={metrics.isLoading}
            className="text-left h-full"
          />
        </div>

        <div
          role="button"
          tabIndex={0}
          aria-label={dict.portfolio.helpConcentrationTitle}
          onKeyDown={(event) => openHelpFromKeyboard(event, "helpConcentrationTitle", "helpConcentrationDesc")}
          className="metric-tile flex-1 min-w-[180px] lg:flex-[1_1_calc(50%-0.5rem)] h-full cursor-pointer rounded-xl transition-all duration-200"
          onClick={() =>
            openHelp("helpConcentrationTitle", "helpConcentrationDesc")
          }
        >
          <StatCard
            label={dict.portfolio.concentration}
            value={
              maxConcentration.category
                ? `${maxConcentration.category} ${formatPercentPoints(maxConcentration.value)}`
                : "—"
            }
            icon={Activity}
            hint={dict.portfolio.concentrationHint}
            loading={metrics.isLoading}
            className="text-left h-full"
          />
        </div>
      </div>

      {pnlMix.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{dict.portfolio.pnlMixHeading}</CardTitle>
            <CardDescription>{dict.portfolio.pnlMixDescription}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {pnlMix.map(([category, value]) => {
              const pct = Math.max(0, Math.min(100, value));
              return (
                <div key={category} className="min-w-0 space-y-2">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate">{category}</span>
                    <span className="shrink-0 font-medium tabular-nums">{formatPercentPoints(value)}</span>
                  </div>
                  <div
                    role="progressbar"
                    aria-label={`${category} · ${dict.portfolio.pnlMixHeading}`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={pct}
                    className="h-2 overflow-hidden rounded-full bg-muted"
                  >
                    <div className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      <Card className="relative">
        <CardHeader>
          <CardTitle className="text-base">
            {dict.portfolio.weightsTitle}
          </CardTitle>
          <CardDescription>{dict.portfolio.weightsDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="ghost"
            size="icon"
            className="cursor-pointer absolute right-2 top-2 z-10 h-6 w-6 p-0 text-muted-foreground/60 hover:bg-muted/80"
              aria-label={dict.portfolio.helpWeightsTitle}
            onClick={() => openHelp("helpWeightsTitle", "helpWeightsDesc")}
          >
            <Library className="h-3.5 w-3.5" />
          </Button>
          {weights.isLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <WeightsBar data={weightsData} />
          )}
        </CardContent>
      </Card>

      <Card className="relative">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">
              {dict.portfolio.allocationTitle}
            </CardTitle>
            <CardDescription>{dict.portfolio.allocationDesc}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="cursor-pointer h-6 w-6 p-0 text-muted-foreground/60 hover:bg-muted/80"
              aria-label={dict.portfolio.helpAllocationTitle}
              onClick={() =>
                openHelp("helpAllocationTitle", "helpAllocationDesc")
              }
            >
              <Library className="h-3.5 w-3.5" />
            </Button>
            <Dialog
              open={editDialogOpen}
              onOpenChange={(open) => {
                if (open) {
                  setEditableWeights(
                    weightList.map((w) => ({
                      strategy_id: w.strategy_id,
                      strategy_name: w.strategy_name ?? w.strategy_id,
                      target_weight: String(w.target_weight ?? 0),
                    })),
                  );
                }
                setEditDialogOpen(open);
              }}
            >
              <DialogTrigger
                render={<Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer hover:bg-muted/20"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  {dict.portfolio.editWeights}
                </Button>}
              />
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>{dict.portfolio.editWeightsTitle}</DialogTitle>
                  <DialogDescription>
                    {dict.portfolio.editWeightsDesc}
                  </DialogDescription>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto py-4">
                  <div className="space-y-4">
                    {editableWeights.map((w, idx) => (
                      <div
                        key={w.strategy_id}
                        className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4"
                      >
                        <div className="w-full sm:w-1/3">
                          <Label
                            htmlFor={`weight-${idx}`}
                            className="text-sm font-medium"
                          >
                            {w.strategy_name}
                          </Label>
                        </div>
                        <div className="flex-1">
                          <Input
                            id={`weight-${idx}`}
                            type="number"
                            min="0"
                            max="100"
                            step="0.5"
                            value={w.target_weight}
                            onChange={(e) =>
                              handleWeightChange(idx, e.target.value)
                            }
                            className="w-full"
                          />
                        </div>
                        <span className="w-12 text-right text-sm text-muted-foreground">
                          %
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t pt-4">
                    <span className="text-sm font-medium">
                      {dict.portfolio.totalSum}
                    </span>
                    <span
                      className={cn(
                        "text-sm font-bold",
                        isWeightSumValid ? "text-green-500" : "text-red-500",
                      )}
                    >
                      {totalWeight.toFixed(1)}%
                      {!isWeightSumValid && " (debe ser 100%)"}
                    </span>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => setEditDialogOpen(false)}
                  >
                    {dict.portfolio.cancel}
                  </Button>
                  <Button
                    className="cursor-pointer"
                    onClick={handleSaveWeights}
                    disabled={setWeight.isPending || !isWeightSumValid}
                  >
                    {setWeight.isPending
                      ? dict.portfolio.saving
                      : dict.portfolio.saveWeights}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>{dict.portfolio.colStrategy}</TableHead>
                  <TableHead className="text-right">
                    {dict.portfolio.colTarget}
                  </TableHead>
                  <TableHead className="text-right">
                    {dict.portfolio.colActual}
                  </TableHead>
                  <TableHead className="text-right">
                    {dict.portfolio.colDeviation}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deviationData.length > 0 ? (
                  deviationData.map((d) => (
                    <TableRow key={d.strategyId}>
                      <TableCell className="font-medium">
                        {d.strategyId}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatPercentPoints(d.target)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatPercentPoints(d.actual)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right tabular-nums",
                          typeof d.deviation === "number" && Math.abs(d.deviation) > 20
                            ? "text-chart-4"
                            : "text-muted-foreground",
                        )}
                      >
                        {formatPercentPoints(d.deviation)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="py-8 text-center text-muted-foreground"
                    >
                      {dict.portfolio.noWeightData}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="relative">
          <CardHeader>
            <CardTitle className="text-base">
              {dict.portfolio.correlationTitle}
            </CardTitle>
            <CardDescription>{dict.portfolio.correlationDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="ghost"
              size="icon"
              className="cursor-pointer absolute right-2 top-2 z-10 h-6 w-6 p-0 text-muted-foreground/60 hover:bg-muted/80"
              aria-label={dict.portfolio.helpCorrelationTitle}
              onClick={() =>
                openHelp("helpCorrelationTitle", "helpCorrelationDesc")
              }
            >
              <Library className="h-3.5 w-3.5" />
            </Button>
            {metrics.isLoading ? (
              <Skeleton className="h-[260px] w-full" />
            ) : hasCorrelation ? (
              <CorrelationHeatmap
                strategies={heatmapStrategies}
                matrix={heatmapMatrix}
              />
            ) : (
              <div className="chart-empty px-5 text-sm">{dict.portfolio.noCorrelation}</div>
            )}
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{dict.portfolio.correlationDataCaveat}</p>
          </CardContent>
        </Card>

        <Card className="relative">
          <CardHeader>
            <CardTitle className="text-base">
              {dict.portfolio.drawdownTitle}
            </CardTitle>
            <CardDescription>{dict.portfolio.drawdownDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="ghost"
              size="icon"
              className="cursor-pointer absolute right-2 top-2 z-10 h-6 w-6 p-0 text-muted-foreground/60 hover:bg-muted/80"
              aria-label={dict.portfolio.helpDrawdownTitle}
              onClick={() => openHelp("helpDrawdownTitle", "helpDrawdownDesc")}
            >
              <Library className="h-3.5 w-3.5" />
            </Button>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {pm?.current_drawdown !== undefined &&
                pm?.current_drawdown !== null
                  ? `Drawdown actual: ${formatPercentPoints(pm.current_drawdown)}`
                  : "Sin datos de drawdown actual"}
              </p>
              <p className="text-sm text-muted-foreground">
                {pm?.max_drawdown !== undefined && pm?.max_drawdown !== null
                  ? `Drawdown máximo: ${formatPercentPoints(pm.max_drawdown)}`
                  : ""}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={helpDialogOpen} onOpenChange={setHelpDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{helpContent.title}</DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-left whitespace-pre-line">
            {helpContent.description}
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </div>
  );
}
