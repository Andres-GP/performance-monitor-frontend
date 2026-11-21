import type { LucideIcon } from "lucide-react";
import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number | undefined;
  icon: LucideIcon;
  hint?: string;
  trend?: "up" | "down" | "neutral";
  loading?: boolean;
  className?: string;
}

export const StatCard = memo(function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  trend = "neutral",
  loading,
  className,
}: StatCardProps) {
  return (
    <Card className={className} aria-busy={loading} data-empty={!loading && (value == null || value === "—")}>
      <CardContent className="flex min-h-[132px] items-start justify-between gap-3 p-5">
        <div className="flex min-w-0 flex-col gap-2">
          <span className="text-[13px] font-medium text-muted-foreground">{label}</span>
          {loading ? (
            <Skeleton className="h-8 w-28 rounded-lg" />
          ) : (
            <span className={cn("metric-number truncate text-[1.7rem] font-semibold leading-tight", (value == null || value === "—") && "text-foreground/55")}>
              {value}
            </span>
          )}
          {hint ? (
            <span
              className={cn(
                "text-xs",
                trend === "up" && "text-chart-1",
                trend === "down" && "text-destructive",
                trend === "neutral" && "text-muted-foreground",
              )}
            >
              {hint}
            </span>
          ) : null}
        </div>
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-[11px] border border-primary/10 bg-primary/[0.07] text-primary">
          <Icon className="size-[17px]" />
        </span>
      </CardContent>
    </Card>
  );
});
