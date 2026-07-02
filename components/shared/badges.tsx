"use client"

import { memo } from "react"
import { Badge } from "@/components/ui/badge"
import { useI18n } from "@/lib/i18n/context"
import { cn } from "@/lib/utils"
import type { HealthStatus, Severity, StrategyStatus } from "@/types"

export const StatusBadge = memo(function StatusBadge({ status }: { status: StrategyStatus }) {
  const { dict } = useI18n()
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5",
        status === "Running"
          ? "border-primary/40 text-primary"
          : "border-muted-foreground/40 text-muted-foreground",
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          status === "Running" ? "bg-primary" : "bg-muted-foreground",
        )}
      />
      {dict.status[status] ?? status}
    </Badge>
  )
})

const healthClass: Record<HealthStatus, string> = {
  healthy: "border-chart-1/40 bg-chart-1/10 text-chart-1",
  edge_decay: "border-chart-4/40 bg-chart-4/10 text-chart-4",
  unhealthy: "border-destructive/40 bg-destructive/10 text-destructive",
}

export const HealthBadge = memo(function HealthBadge({ status }: { status: HealthStatus }) {
  const { dict } = useI18n()
  const className = healthClass[status] ?? healthClass.unhealthy
  return (
    <Badge variant="outline" className={cn(className)}>
      {dict.health[status] ?? status}
    </Badge>
  )
})

const severityMap: Record<Severity, string> = {
  high: "border-destructive/40 bg-destructive/10 text-destructive",
  medium: "border-chart-4/40 bg-chart-4/10 text-chart-4",
  low: "border-muted-foreground/40 bg-muted/40 text-muted-foreground",
}

export const SeverityBadge = memo(function SeverityBadge({ severity }: { severity: Severity }) {
  const { dict } = useI18n()
  return (
    <Badge variant="outline" className={cn(severityMap[severity] ?? severityMap.low)}>
      {dict.severity[severity] ?? severity}
    </Badge>
  )
})
