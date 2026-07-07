"use client"

import { memo } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { formatDateShort } from "@/lib/format"

export default memo(function DrawdownChart({
  data,
}: {
  data: { timestamp: string; drawdown: number }[]
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="ddFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-destructive)" stopOpacity={0.05} />
            <stop offset="100%" stopColor="var(--color-destructive)" stopOpacity={0.35} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis
          dataKey="timestamp"
          tickFormatter={formatDateShort}
          stroke="var(--color-muted-foreground)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          minTickGap={24}
        />
        <YAxis
          stroke="var(--color-muted-foreground)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          width={48}
          tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
        />
        <Tooltip
          contentStyle={{
            background: "var(--color-popover)",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            color: "var(--color-popover-foreground)",
          }}
          labelFormatter={(l) => formatDateShort(l as string)}
          formatter={(value: number) => [`${(value * 100).toFixed(2)}%`, "Drawdown"]}
        />
        <Area
          type="monotone"
          dataKey="drawdown"
          stroke="var(--color-destructive)"
          strokeWidth={2}
          fill="url(#ddFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
})
