"use client";

import { Activity, Receipt, TrendingDown } from "lucide-react";
import {
  CapitalPie,
  DrawdownChart,
  WeightsBar,
} from "@/components/charts/lazy";
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
  //useCapitalSummary,
  usePortfolioMetrics,
  usePortfolioWeights,
} from "@/lib/queries";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";

export function PortfolioView() {
  const { dict } = useI18n();

  //const capital = useCapitalSummary();
  const weights = usePortfolioWeights();
  const metrics = usePortfolioMetrics();

  const isFallback =
    //capital.data?.isFallback ||
    weights.data?.isFallback || metrics.data?.isFallback;
  //const summary = capital.data?.data;
  const weightList = weights.data?.data ?? [];
  const pm = metrics.data?.data;

  // Etiquetas de tipos de cuenta traducidas
  const accountLabels: Record<string, string> = {
    demo: dict.portfolio.accountDemo,
    real: dict.portfolio.accountReal,
    funded: dict.portfolio.accountFunded,
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold">{dict.portfolio.title}</h2>
        <p className="text-sm text-muted-foreground">
          {dict.portfolio.subtitle}
        </p>
      </div>

      {isFallback && <OfflineBanner />}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* <StatCard
          label={dict.portfolio.capitalTotal}
          value={formatCurrency(summary?.total)}
          icon={Activity}
          hint={dict.portfolio.capitalHint}
          loading={capital.isLoading}
        /> */}
        <StatCard
          label={dict.portfolio.portfolioSharpe}
          value={formatNumber(pm?.sharpe)}
          icon={Activity}
          hint={dict.portfolio.portfolioSharpeHint}
          trend="up"
          loading={metrics.isLoading}
        />
        <StatCard
          label={dict.portfolio.combinedDrawdown}
          value={formatPercent(pm?.combined_drawdown)}
          icon={TrendingDown}
          hint={dict.portfolio.combinedDrawdownHint}
          trend="down"
          loading={metrics.isLoading}
        />
        <StatCard
          label={dict.portfolio.transactionCosts}
          value={formatCurrency(pm?.transaction_costs)}
          icon={Receipt}
          hint={dict.portfolio.transactionCostsHint}
          loading={metrics.isLoading}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {dict.portfolio.capitalByAccount}
            </CardTitle>
            <CardDescription>
              {dict.portfolio.capitalByAccountDesc}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {capital.isLoading ? (
              <Skeleton className="h-[260px] w-full" />
            ) : (
              <CapitalPie data={summary?.accounts ?? []} />
            )}
            <div className="mt-4 flex flex-col gap-2">
              {(summary?.accounts ?? []).map((a) => (
                <div
                  key={a.account_type}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-muted-foreground">
                    {accountLabels[a.account_type] ?? a.account_type}
                  </span>
                  <span className="font-medium tabular-nums">
                    {formatCurrency(a.capital)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card> */}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {dict.portfolio.weightsTitle}
            </CardTitle>
            <CardDescription>{dict.portfolio.weightsDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            {weights.isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <WeightsBar data={weightList} />
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {dict.portfolio.allocationTitle}
          </CardTitle>
          <CardDescription>{dict.portfolio.allocationDesc}</CardDescription>
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
                {weightList.map((w) => {
                  const deviation =
                    (w.actual_weight ?? 0) - (w.target_weight ?? 0);
                  return (
                    <TableRow key={w.strategy_id}>
                      <TableCell className="font-medium">
                        {w.strategy_name ?? w.strategy_id}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatPercent(w.target_weight)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatPercent(w.actual_weight)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right tabular-nums",
                          Math.abs(deviation) > 0.03
                            ? "text-chart-4"
                            : "text-muted-foreground",
                        )}
                      >
                        {deviation >= 0 ? "+" : ""}
                        {formatPercent(deviation)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {dict.portfolio.correlationTitle}
            </CardTitle>
            <CardDescription>{dict.portfolio.correlationDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            {metrics.isLoading ? (
              <Skeleton className="h-[260px] w-full" />
            ) : pm?.correlation_matrix ? (
              <CorrelationHeatmap
                strategies={pm.correlation_matrix.strategies}
                matrix={pm.correlation_matrix.matrix}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                {dict.portfolio.noCorrelation}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {dict.portfolio.drawdownTitle}
            </CardTitle>
            <CardDescription>{dict.portfolio.drawdownDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            {metrics.isLoading ? (
              <Skeleton className="h-[260px] w-full" />
            ) : (
              <DrawdownChart data={pm?.drawdown_series ?? []} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
