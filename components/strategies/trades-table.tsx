"use client"

import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { OfflineBanner } from "@/components/shared/offline-banner"
import { useTrades } from "@/lib/queries"
import { formatCurrency, formatDate, formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 12

export function TradesTable({ strategyId }: { strategyId: string }) {
  const { data, isLoading } = useTrades(strategyId)
  const [page, setPage] = useState(0)

  const trades = data?.data ?? []
  const totalPages = Math.max(1, Math.ceil(trades.length / PAGE_SIZE))

  const pageTrades = useMemo(
    () => trades.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE),
    [trades, page],
  )

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (trades.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center text-sm text-muted-foreground">
          No hay operaciones registradas para esta estrategia.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {data?.isFallback && <OfflineBanner />}

      <div className="overflow-hidden rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Símbolo</TableHead>
              <TableHead>Lado</TableHead>
              <TableHead className="text-right">Entrada</TableHead>
              <TableHead className="text-right">Salida</TableHead>
              <TableHead className="text-right">Cant.</TableHead>
              <TableHead className="text-right">PnL</TableHead>
              <TableHead className="hidden text-right md:table-cell">Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageTrades.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">{t.symbol ?? "—"}</TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "rounded-md px-2 py-0.5 text-xs font-medium capitalize",
                      t.side === "long"
                        ? "bg-chart-1/10 text-chart-1"
                        : "bg-chart-2/10 text-chart-2",
                    )}
                  >
                    {t.side === "long" ? "Largo" : "Corto"}
                  </span>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatNumber(t.entry_price)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatNumber(t.exit_price)}
                </TableCell>
                <TableCell className="text-right tabular-nums">{t.quantity ?? "—"}</TableCell>
                <TableCell
                  className={cn(
                    "text-right font-medium tabular-nums",
                    t.pnl >= 0 ? "text-chart-1" : "text-destructive",
                  )}
                >
                  {formatCurrency(t.pnl)}
                </TableCell>
                <TableCell className="hidden text-right text-muted-foreground md:table-cell">
                  {formatDate(t.entry_time)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {trades.length} operaciones · página {page + 1} de {totalPages}
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
  )
}
