"use client"

import Link from "next/link"
import { ChevronRight, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { HealthBadge, StatusBadge } from "@/components/shared/badges"
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Strategy } from "@/types"

export function StrategiesTable({
  strategies,
  onDelete,
}: {
  strategies: Strategy[]
  onDelete: (s: Strategy) => void
}) {
  if (strategies.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
        No hay estrategias que coincidan con los filtros.
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Estrategia</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Salud</TableHead>
            <TableHead className="text-right">Win Rate</TableHead>
            <TableHead className="text-right">Profit Factor</TableHead>
            <TableHead className="text-right">Drawdown</TableHead>
            <TableHead className="text-right">Trades</TableHead>
            <TableHead className="w-24 text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {strategies.map((s) => (
            <TableRow key={s.id} className="group">
              <TableCell>
                <Link
                  href={`/strategies/${s.id}`}
                  className="flex flex-col transition-colors hover:text-primary"
                >
                  <span className="font-medium">{s.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {s.instrument} · {s.platform}
                  </span>
                </Link>
              </TableCell>
              <TableCell>
                <StatusBadge status={s.status} />
              </TableCell>
              <TableCell>
                <HealthBadge status={s.health_status} />
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatPercent(s.win_rate)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatNumber(s.profit_factor)}
              </TableCell>
              <TableCell
                className={cn(
                  "text-right tabular-nums",
                  s.drawdown <= -0.15 ? "text-destructive" : "text-foreground",
                )}
              >
                {formatPercent(s.drawdown)}
              </TableCell>
              <TableCell className="text-right tabular-nums">{s.trades_count}</TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Eliminar ${s.name}`}
                    onClick={() => onDelete(s)}
                  >
                    <Trash2 className="size-4 text-muted-foreground transition-colors hover:text-destructive" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Ver ${s.name}`}
                    nativeButton={false}
                    render={<Link href={`/strategies/${s.id}`} />}
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
