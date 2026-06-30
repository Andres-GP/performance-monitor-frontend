"use client";

import Link from "next/link";
import { SeverityBadge } from "@/components/shared/badges";
import { Button } from "@/components/ui/button";
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
import { formatDate } from "@/lib/format";
import { useI18n } from "@/lib/i18n/context";
import { useAlerts } from "@/lib/queries";

export function RecentAlerts() {
  const { dict } = useI18n();
  const { data, isLoading } = useAlerts();
  const alerts = (data?.data ?? []).slice(0, 5);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div className="space-y-1.5">
          <CardTitle>{dict.dashboard.latestAlerts}</CardTitle>
          <CardDescription>{dict.dashboard.latestAlertsDesc}</CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link href="/alerts" />}
        >
          {dict.dashboard.viewAll}
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
                <TableHead>{dict.alerts.colProblem}</TableHead>
                <TableHead className="hidden sm:table-cell">
                  {dict.alerts.colStrategy}
                </TableHead>
                <TableHead>{dict.alerts.colSeverity}</TableHead>
                <TableHead className="text-right">
                  {dict.alerts.colDate}
                </TableHead>
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
  );
}
