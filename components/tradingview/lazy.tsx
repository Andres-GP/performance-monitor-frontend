"use client"

import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"

export const TvWidget = dynamic(() => import("./tv-widget"), {
  ssr: false,
  // Match the embed's dark canvas so there is no white flash before the chart
  // paints. `min-h` keeps the placeholder from collapsing for taller widgets.
  loading: () => (
    <Skeleton className="h-[400px] min-h-[400px] w-full rounded-md border border-border bg-[#131722]" />
  ),
})
