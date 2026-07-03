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
    <Card className={className}>
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-sm text-muted-foreground">{label}</span>
          {loading ? (
            <Skeleton className="h-7 w-24" />
          ) : (
            <span className="truncate text-2xl font-semibold tracking-tight">
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
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" />
        </span>
      </CardContent>
    </Card>
  );
});
