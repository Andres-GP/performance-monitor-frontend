"use client"

import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"

export const TvWidget = dynamic(() => import("./tv-widget"), {
  ssr: false,
  loading: () => <Skeleton className="h-[400px] w-full" />,
})
