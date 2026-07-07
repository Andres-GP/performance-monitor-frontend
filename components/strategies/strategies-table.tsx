"use client";

import Link from "next/link";
import { ChevronRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { HealthBadge, StatusBadge } from "@/components/shared/badges";
import { formatNumber, formatPercent, formatDate } from "@/lib/format";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import type { Strategy } from "@/types";

export function StrategiesTable({
  strategies,
  onDelete,
}: {
  strategies: Strategy[];
  onDelete: (s: Strategy) => void;
}) {
  const { dict, t } = useI18n();

  if (strategies.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
        {dict.strategies.empty}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>{dict.strategies.colStrategy}</TableHead>
              <TableHead>{dict.strategies.colStatus}</TableHead>
              <TableHead>{dict.strategies.colHealth}</TableHead>
              <TableHead className="text-right">
                {dict.strategies.colWinRate}
              </TableHead>
              <TableHead className="text-right">
                {dict.strategies.colProfitFactor}
              </TableHead>
              <TableHead className="text-right">
                {dict.strategies.colDrawdown}
              </TableHead>
              <TableHead className="text-right">
                {dict.strategies.colTrades}
              </TableHead>
              <TableHead className="text-center">
                {dict.strategies.alertsInLast30Days}
              </TableHead>
              <TableHead className="text-center">
                {dict.strategies.strategyId}
              </TableHead>
              <TableHead className="text-center">
                {dict.strategies.creationDate}
              </TableHead>
              <TableHead className="text-center">
                {dict.strategies.timeFrame}
              </TableHead>
              <TableHead className="text-center">
                {dict.strategies.dataType}
              </TableHead>
              <TableHead className="text-center">
                {dict.strategies.sizing}
              </TableHead>
              <TableHead className="text-center">Edge</TableHead>
              <TableHead className="text-center">Backtest</TableHead>
              <TableHead className="w-24 text-right">
                {dict.strategies.colActions}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {strategies.map((s) => {
              const metrics = s.metrics || {};
              const winRate = metrics.win_rate ?? null;
              const profitFactor = metrics.profit_factor ?? null;
              const drawdown = metrics.drawdown ?? null;
              const hasMetrics = metrics && Object.keys(metrics).length > 0;

              return (
                <TableRow key={s.strategy_id} className="group">
                  <TableCell className="flex flex-col">
                    <span className="font-medium">{s.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {s.instrument} · {s.platform}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={s.state} />
                  </TableCell>
                  <TableCell>
                    <HealthBadge status={s.health_status} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {hasMetrics && winRate !== null
                      ? formatPercent(winRate)
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {hasMetrics && profitFactor !== null
                      ? formatNumber(profitFactor)
                      : "—"}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right tabular-nums",
                      drawdown !== null && drawdown <= -0.15
                        ? "text-destructive"
                        : "text-foreground",
                    )}
                  >
                    {hasMetrics && drawdown !== null
                      ? formatPercent(drawdown)
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {s.trades_count ?? 0}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {s.alerts_30d}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {s.strategy_id.slice(-6)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatDate(s.start_date)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {s.timeframe || "—"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {s.data_type || "—"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {s.sizing ?? "—"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {s.edge_health ? (
                      <span className="text-green-500">✓</span>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {s.backtest ? (
                      <span className="text-blue-500">✓</span>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={t(dict.strategies.deleteAria, {
                          name: s.name,
                        })}
                        onClick={() => onDelete(s)}
                        className="cursor-pointer"
                      >
                        <Trash2 className="size-4 text-muted-foreground transition-colors hover:text-destructive" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={t(dict.strategies.viewAria, {
                          name: s.name,
                        })}
                        nativeButton={false}
                        render={<Link href={`/strategies/${s.strategy_id}`} />}
                      >
                        <ChevronRight className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
