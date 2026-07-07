"use client";

import { useState } from "react";
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
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
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

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editableWeights, setEditableWeights] = useState<
    { strategy_id: string; strategy_name: string; target_weight: number }[]
  >([]);

  const handleWeightChange = (index: number, value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;
    const newWeights = [...editableWeights];
    newWeights[index].target_weight = Math.min(Math.max(numValue, 0), 100);
    setEditableWeights(newWeights);
  };

  const totalWeight = editableWeights.reduce(
    (sum, w) => sum + (w.target_weight || 0),
    0,
  );
  const isWeightSumValid = Math.abs(totalWeight - 100) < 0.01;

  const handleSaveWeights = async () => {
    if (!isWeightSumValid) {
      toast.error("La suma de los pesos debe ser 100%");
      return;
    }

    const promises = editableWeights.map((w) =>
      setWeight.mutateAsync({
        strategy_id: w.strategy_id,
        target_weight: w.target_weight,
      }),
    );

    try {
      await Promise.all(promises);
      setEditDialogOpen(false);
    } catch (error) {}
  };

  const allocationDeviations = pm?.allocation_deviations ?? {};
  const concentrationMetrics = pm?.concentration_metrics ?? {};

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

  const correlationMatrix = pm?.correlation_matrix ?? {};
  const hasCorrelation =
    correlationMatrix &&
    typeof correlationMatrix === "object" &&
    !correlationMatrix.note &&
    Object.keys(correlationMatrix).length > 0;

  let heatmapStrategies: string[] = [];
  let heatmapMatrix: number[][] = [];

  if (hasCorrelation) {
    heatmapStrategies = Object.keys(correlationMatrix);
    heatmapMatrix = heatmapStrategies.map((s1) =>
      heatmapStrategies.map((s2) => {
        const val = correlationMatrix[s1]?.[s2];
        return typeof val === "number" ? val : 0;
      }),
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold">{dict.portfolio.title}</h2>
        <p className="text-sm text-muted-foreground">
          {dict.portfolio.subtitle}
        </p>
      </div>

      {isFallback && <OfflineBanner />}

      <div className="flex flex-wrap gap-4">
        <div
          className="flex-1 min-w-[180px] lg:flex-[1_1_calc(33.333%-1rem)] h-full cursor-pointer rounded-lg border border-border/50 transition-all duration-200 hover:bg-muted/30 hover:-translate-y-1 hover:shadow-md hover:border-primary/30"
          onClick={() => openHelp("helpSharpeTitle", "helpSharpeDesc")}
        >
          <StatCard
            label={dict.portfolio.portfolioSharpe}
            value={formatNumber(pm?.sharpe)}
            icon={Activity}
            hint={dict.portfolio.portfolioSharpeHint}
            trend="up"
            loading={metrics.isLoading}
            className="text-left h-45"
          />
        </div>

        <div
          className="flex-1 min-w-[180px] lg:flex-[1_1_calc(33.333%-1rem)] h-full cursor-pointer rounded-lg border border-border/50 transition-all duration-200 hover:bg-muted/30 hover:-translate-y-1 hover:shadow-md hover:border-primary/30"
          onClick={() => openHelp("helpDrawdownTitle", "helpDrawdownDesc")}
        >
          <StatCard
            label={dict.portfolio.combinedDrawdown}
            value={formatPercent(pm?.max_drawdown ?? 0)}
            icon={TrendingDown}
            hint={dict.portfolio.combinedDrawdownHint}
            trend="down"
            loading={metrics.isLoading}
            className="text-left h-45"
          />
        </div>

        <div
          className="flex-1 min-w-[180px] lg:flex-[1_1_calc(33.333%-1rem)] h-full cursor-pointer rounded-lg border border-border/50 transition-all duration-200 hover:bg-muted/30 hover:-translate-y-1 hover:shadow-md hover:border-primary/30"
          onClick={() =>
            openHelp("helpTransactionCostsTitle", "helpTransactionCostsDesc")
          }
        >
          <StatCard
            label={dict.portfolio.transactionCosts}
            value={formatPercent(pm?.transaction_cost_pct ?? 0)}
            icon={Receipt}
            hint={dict.portfolio.transactionCostsHint}
            loading={metrics.isLoading}
            className="text-left h-45"
          />
        </div>

        <div
          className="flex-1 min-w-[180px] lg:flex-[1_1_calc(50%-0.5rem)] h-full cursor-pointer rounded-lg border border-border/50 transition-all duration-200 hover:bg-muted/30 hover:-translate-y-1 hover:shadow-md hover:border-primary/30"
          onClick={() => openHelp("helpRuinTitle", "helpRuinDesc")}
        >
          <StatCard
            label={dict.portfolio.ruinProbability}
            value={formatPercent(pm?.ruin_probability ?? 0)}
            icon={Activity}
            hint={dict.portfolio.ruinProbabilityHint}
            loading={metrics.isLoading}
            className="text-left h-45"
          />
        </div>

        <div
          className="flex-1 min-w-[180px] lg:flex-[1_1_calc(50%-0.5rem)] h-full cursor-pointer rounded-lg border border-border/50 transition-all duration-200 hover:bg-muted/30 hover:-translate-y-1 hover:shadow-md hover:border-primary/30"
          onClick={() =>
            openHelp("helpConcentrationTitle", "helpConcentrationDesc")
          }
        >
          <StatCard
            label={dict.portfolio.concentration}
            value={
              maxConcentration.category
                ? `${maxConcentration.category} ${formatPercent(maxConcentration.value)}`
                : "N/A"
            }
            icon={Activity}
            hint={dict.portfolio.concentrationHint}
            loading={metrics.isLoading}
            className="text-left h-45"
          />
        </div>
      </div>

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
                      target_weight: w.target_weight ?? 0,
                    })),
                  );
                }
                setEditDialogOpen(open);
              }}
            >
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer hover:bg-muted/20"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  {dict.portfolio.editWeights}
                </Button>
              </DialogTrigger>
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
                        className="flex items-center gap-4"
                      >
                        <div className="w-1/3">
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
                            value={w.target_weight ?? 0}
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
          <div className="overflow-hidden rounded-lg border border-border">
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
                        {formatPercent(d.target)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatPercent(d.actual)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right tabular-nums",
                          Math.abs(d.deviation) > 20
                            ? "text-chart-4"
                            : "text-muted-foreground",
                        )}
                      >
                        {d.deviation >= 0 ? "+" : ""}
                        {formatPercent(d.deviation)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground"
                    >
                      No hay datos de asignación
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
              <p className="text-sm text-muted-foreground">
                {dict.portfolio.noCorrelation}
              </p>
            )}
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
              onClick={() => openHelp("helpDrawdownTitle", "helpDrawdownDesc")}
            >
              <Library className="h-3.5 w-3.5" />
            </Button>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {pm?.current_drawdown !== undefined &&
                pm?.current_drawdown !== null
                  ? `Drawdown actual: ${formatPercent(pm.current_drawdown)}`
                  : "Sin datos de drawdown actual"}
              </p>
              <p className="text-sm text-muted-foreground">
                {pm?.max_drawdown !== undefined && pm?.max_drawdown !== null
                  ? `Drawdown máximo: ${formatPercent(pm.max_drawdown)}`
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
