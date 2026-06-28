"use client"

import Link from "next/link"
import { SeverityBadge } from "@/components/shared/badges"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDate } from "@/lib/format"
import { useAlerts } from "@/lib/queries"

export function RecentAlerts() {
  const { data, isLoading } = useAlerts()
  const alerts = (data?.data ?? []).slice(0, 5)

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div className="space-y-1.5">
          <CardTitle>Últimas Alertas de Salud</CardTitle>
          <CardDescription>Eventos recientes de las estrategias</CardDescription>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/alerts">Ver todas</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Problema</TableHead>
                <TableHead className="hidden sm:table-cell">Estrategia</TableHead>
                <TableHead>Severidad</TableHead>
                <TableHead className="text-right">Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alerts.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.problem}</TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">
                    {a.strategy_name ?? a.strategy_id}
                  </TableCell>
                  <TableCell>
                    <SeverityBadge severity={a.severity} />
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatDate(a.timestamp)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
