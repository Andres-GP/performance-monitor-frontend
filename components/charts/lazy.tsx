"use client"

import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"

const chartLoader = (height: number) => () => (
  <Skeleton className="w-full" style={{ height }} />
)

export const EquityChart = dynamic(() => import("./equity-chart"), {
  ssr: false,
  loading: chartLoader(300),
})

export const CapitalPie = dynamic(() => import("./capital-pie"), {
  ssr: false,
  loading: chartLoader(260),
})

export const WeightsBar = dynamic(() => import("./weights-bar"), {
  ssr: false,
  loading: chartLoader(300),
})

export const DrawdownChart = dynamic(() => import("./drawdown-chart"), {
  ssr: false,
  loading: chartLoader(260),
})

export const MetricChart = dynamic(() => import("./metric-chart"), {
  ssr: false,
  loading: chartLoader(240),
})
