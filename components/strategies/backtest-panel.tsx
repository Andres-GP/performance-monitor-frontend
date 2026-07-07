"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n/context";
import { useStrategy } from "@/lib/queries";
import { formatNumber, formatPercent } from "@/lib/format";
import {
  Calendar,
  DollarSign,
  BarChart3,
  TrendingDown,
  Sliders,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function BacktestPanel({ strategyId }: { strategyId: string }) {
  const { dict } = useI18n();
  const { strategy } = useStrategy(strategyId);

  // Si no hay estrategia o no tiene backtest
  if (!strategy || !strategy.backtest) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Datos de Backtest</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <BarChart3 className="size-12 mb-4 opacity-50" />
            <p className="text-sm">
              No hay datos de backtest disponibles para esta estrategia.
            </p>
            <p className="text-xs mt-1">
              Puedes subir un backtest usando el formulario de arriba.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const backtest = strategy.backtest;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <BarChart3 className="size-4" />
          {dict.backtest.dataTitle}
          <Badge variant="outline" className="ml-2">
            {backtest.period_start} → {backtest.period_end}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <DollarSign className="size-3" />
              {dict.backtest.expectedPnl}
            </p>
            <p className="text-lg font-semibold">
              {formatNumber(backtest.expected_pnl)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <BarChart3 className="size-3" />
              {dict.backtest.sharpe}
            </p>
            <p className="text-lg font-semibold">
              {formatNumber(backtest.expected_sharpe)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <TrendingDown className="size-3" />
              {dict.backtest.drowdown}
            </p>
            <p className="text-lg font-semibold">
              {formatPercent(backtest.expected_drawdown / 100)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Calendar className="size-3" />
              {dict.backtest.period}
            </p>
            <p className="text-sm font-mono">
              {backtest.period_start} → {backtest.period_end}
            </p>
          </div>
        </div>

        {backtest.parameters && Object.keys(backtest.parameters).length > 0 && (
          <div className="mt-4 border-t pt-4">
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Sliders className="size-3" />
              {dict.backtest.parameters}
            </p>
            <pre className="mt-1 rounded-md bg-muted p-2 text-xs font-mono overflow-x-auto">
              {JSON.stringify(backtest.parameters, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
