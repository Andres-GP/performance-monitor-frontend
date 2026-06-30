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
  useCapitalSummary,
  usePortfolioMetrics,
  usePortfolioWeights,
} from "@/lib/queries";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

const accountLabels: Record<string, string> = {
  demo: "Demo",
  real: "Real",
  funded: "Fondeada",
};

export function PortfolioView() {
  const capital = useCapitalSummary();
  const weights = usePortfolioWeights();
  const metrics = usePortfolioMetrics();

  const isFallback =
    capital.data?.isFallback ||
    weights.data?.isFallback ||
    metrics.data?.isFallback;
  const summary = capital.data?.data;
  const weightList = weights.data?.data ?? [];
  const pm = metrics.data?.data;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold">Portafolio</h2>
        <p className="text-sm text-muted-foreground">
          Asignación de capital, correlaciones y riesgo combinado de la cartera
        </p>
      </div>

      {isFallback && <OfflineBanner />}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Capital Total"
          value={formatCurrency(summary?.total)}
          icon={Activity}
          hint="Todas las cuentas"
          loading={capital.isLoading}
        />
        <StatCard
          label="Sharpe Portafolio"
          value={formatNumber(pm?.sharpe)}
          icon={Activity}
          hint="Retorno ajustado a riesgo"
          trend="up"
          loading={metrics.isLoading}
        />
        <StatCard
          label="Drawdown Combinado"
          value={formatPercent(pm?.combined_drawdown)}
          icon={TrendingDown}
          hint="Máxima caída de la cartera"
          trend="down"
          loading={metrics.isLoading}
        />
        <StatCard
          label="Costos de Transacción"
          value={formatCurrency(pm?.transaction_costs)}
          icon={Receipt}
          hint="Acumulado"
          loading={metrics.isLoading}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Capital por Tipo de Cuenta
            </CardTitle>
            <CardDescription>
              Distribución entre cuentas demo, real y fondeada
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
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Pesos Objetivo vs Reales
            </CardTitle>
            <CardDescription>
              Asignación planificada contra la actual
            </CardDescription>
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
          <CardTitle className="text-base">Asignación de Pesos</CardTitle>
          <CardDescription>Detalle por estrategia</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Estrategia</TableHead>
                  <TableHead className="text-right">Objetivo</TableHead>
                  <TableHead className="text-right">Real</TableHead>
                  <TableHead className="text-right">Desviación</TableHead>
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
            <CardTitle className="text-base">Matriz de Correlación</CardTitle>
            <CardDescription>
              Correlación entre estrategias del portafolio
            </CardDescription>
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
                Sin datos de correlación.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Drawdown Combinado</CardTitle>
            <CardDescription>
              Evolución del drawdown de la cartera
            </CardDescription>
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
