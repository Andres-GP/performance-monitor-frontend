import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { HealthStatus, Severity, StrategyStatus } from "@/types"

export function StatusBadge({ status }: { status: StrategyStatus }) {
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
      {status}
    </Badge>
  )
}

const healthMap: Record<HealthStatus, { label: string; className: string }> = {
  healthy: { label: "Healthy", className: "border-chart-1/40 bg-chart-1/10 text-chart-1" },
  edge_decay: { label: "Edge Decay", className: "border-chart-4/40 bg-chart-4/10 text-chart-4" },
  unhealthy: { label: "Unhealthy", className: "border-destructive/40 bg-destructive/10 text-destructive" },
}

export function HealthBadge({ status }: { status: HealthStatus }) {
  const cfg = healthMap[status] ?? healthMap.unhealthy
  return (
    <Badge variant="outline" className={cn(cfg.className)}>
      {cfg.label}
    </Badge>
  )
}

const severityMap: Record<Severity, string> = {
  high: "border-destructive/40 bg-destructive/10 text-destructive",
  medium: "border-chart-4/40 bg-chart-4/10 text-chart-4",
  low: "border-muted-foreground/40 bg-muted/40 text-muted-foreground",
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <Badge variant="outline" className={cn("capitalize", severityMap[severity] ?? severityMap.low)}>
      {severity}
    </Badge>
  )
}
