"use client"

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { formatDateShort } from "@/lib/format"
import type { PerformanceMetric } from "@/types"

interface MetricChartProps {
  data: PerformanceMetric[]
  dataKey: keyof PerformanceMetric
  label: string
  asPercent?: boolean
}

export default function MetricChart({ data, dataKey, label, asPercent }: MetricChartProps) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
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
          tickFormatter={(v) => (asPercent ? `${(v * 100).toFixed(0)}%` : v.toFixed(1))}
        />
        <Tooltip
          contentStyle={{
            background: "var(--color-popover)",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            color: "var(--color-popover-foreground)",
          }}
          labelFormatter={(l) => formatDateShort(l as string)}
          formatter={(value: number) => [
            asPercent ? `${(value * 100).toFixed(2)}%` : value.toFixed(2),
            label,
          ]}
        />
        <Line
          type="monotone"
          dataKey={dataKey as string}
          stroke="var(--color-chart-1)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
