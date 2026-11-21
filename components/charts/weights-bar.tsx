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
import { useI18n } from "@/lib/i18n/context"

export default memo(function WeightsBar({ data }: { data: PortfolioWeight[] }) {
  const { dict } = useI18n()
  const chartData = data.map((w) => ({
    name: w.strategy_name ?? w.strategy_id,
    target: w.target_weight,
    actual: w.actual_weight,
  }))

  if (!chartData.length) {
    return <div className="chart-empty h-[300px] px-5 text-sm">{dict.portfolio.noWeightData}</div>
  }

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
          formatter={(value, name) => [value == null ? "—" : `${Number(value)}%`, name === "target" ? dict.portfolio.colTarget : dict.portfolio.colActual]}
        />
        <Legend
          formatter={(v) => (v === "target" ? dict.portfolio.colTarget : dict.portfolio.colActual)}
          wrapperStyle={{ fontSize: 12 }}
        />
        <Bar dataKey="target" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="actual" fill="var(--color-chart-3)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
})
