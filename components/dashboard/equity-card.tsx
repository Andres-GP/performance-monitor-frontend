"use client"

import { EquityChart } from "@/components/charts/lazy"
import { OfflineBanner } from "@/components/shared/offline-banner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useI18n } from "@/lib/i18n/context"
import { useEquityCurve } from "@/lib/queries"

export function EquityCard() {
  const { dict } = useI18n()
  const { data, isLoading } = useEquityCurve()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{dict.dashboard.equityTitle}</CardTitle>
        <CardDescription>{dict.dashboard.equityDesc}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <OfflineBanner show={!!data?.isFallback} />
        {isLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : (
          <EquityChart data={data?.data ?? []} />
        )}
      </CardContent>
    </Card>
  )
}
