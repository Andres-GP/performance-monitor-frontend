"use client"

import { EquityChart } from "@/components/charts/lazy"
import { OfflineBanner } from "@/components/shared/offline-banner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useEquityCurve } from "@/lib/queries"

export function EquityCard() {
  const { data, isLoading } = useEquityCurve()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolución del Capital</CardTitle>
        <CardDescription>Curva de equity de los últimos 30 días</CardDescription>
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
