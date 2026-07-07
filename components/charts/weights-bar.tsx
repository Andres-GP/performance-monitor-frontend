"use client"

import { memo } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { PortfolioWeight } from "@/types"

export default memo(function WeightsBar({ data }: { data: PortfolioWeight[] }) {
  const chartData = data.map((w) => ({
    name: w.strategy_name ?? w.strategy_id,
    target: Math.round((w.target_weight ?? 0) * 100),
    actual: Math.round((w.actual_weight ?? 0) * 100),
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis
          dataKey="name"
          stroke="var(--color-muted-foreground)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="var(--color-muted-foreground)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          width={40}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip
          cursor={{ fill: "var(--color-muted)", opacity: 0.3 }}
          contentStyle={{
            background: "var(--color-popover)",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            color: "var(--color-popover-foreground)",
          }}
          formatter={(value: number, name: string) => [`${value}%`, name === "target" ? "Objetivo" : "Real"]}
        />
        <Legend
          formatter={(v) => (v === "target" ? "Objetivo" : "Real")}
          wrapperStyle={{ fontSize: 12 }}
        />
        <Bar dataKey="target" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="actual" fill="var(--color-chart-3)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
})
