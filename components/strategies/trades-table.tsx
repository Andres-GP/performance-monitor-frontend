"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OfflineBanner } from "@/components/shared/offline-banner";
import { useTrades } from "@/lib/queries";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import type { Trade } from "@/types";

const PAGE_SIZE = 12;
const EMPTY_TRADES: Trade[] = [];

export function TradesTable({ strategyId }: { strategyId: string }) {
  const { dict, t } = useI18n();
  const [page, setPage] = useState(0);
  const { data, isLoading } = useTrades(strategyId, page, PAGE_SIZE);

  const trades = data?.data?.items ?? EMPTY_TRADES;
  const totalPages = Math.max(1, Math.ceil((data?.data?.total ?? trades.length) / PAGE_SIZE));
  const pageTrades = trades;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (trades.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center text-sm text-muted-foreground">
          {dict.trades.empty}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {data?.isFallback && <OfflineBanner />}

      <div className="overflow-hidden rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>{dict.trades.colSymbol}</TableHead>
              <TableHead>{dict.trades.colSide}</TableHead>
              <TableHead className="text-right">
                {dict.trades.colEntry}
              </TableHead>
              <TableHead className="text-right">
                {dict.trades.colExit}
              </TableHead>
              <TableHead className="text-right">{dict.trades.colQty}</TableHead>
              <TableHead className="text-right">{dict.trades.colPnl}</TableHead>
              <TableHead className="hidden text-right md:table-cell">
                {dict.trades.colDate}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageTrades.map((trade) => {
              const tradePnl = trade.pnl ?? trade.profit;
              const direction = trade.direction ?? trade.side;
              return (
              <TableRow key={trade.id}>
                <TableCell className="font-medium">
                  {trade.instrument ?? trade.symbol ?? dict.common.none}
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "rounded-md px-2 py-0.5 text-xs font-medium",
                      direction === "long"
                        ? "bg-chart-1/10 text-chart-1"
                        : "bg-chart-2/10 text-chart-2",
                    )}
                  >
                    {direction ?? dict.common.none}
                  </span>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatNumber(trade.entry_price)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatNumber(trade.exit_price)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {trade.quantity ?? dict.common.none}
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right font-medium tabular-nums",
                    tradePnl == null
                      ? "text-muted-foreground"
                      : tradePnl >= 0
                        ? "text-chart-1"
                        : "text-destructive",
                  )}
                >
                  {formatCurrency(tradePnl)}
                </TableCell>
                <TableCell className="hidden text-right text-muted-foreground md:table-cell">
                  {formatDate(trade.entry_time)}
                </TableCell>
              </TableRow>
            );})}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {t(dict.strategyDetail.operations, {
            trades: data?.data?.total ?? trades.length,
            page: page + 1,
            totalPages: totalPages,
          })}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Página anterior"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Página siguiente"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
