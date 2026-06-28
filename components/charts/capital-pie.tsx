"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { formatCurrency } from "@/lib/format"
import type { CapitalAccount } from "@/types"

const COLORS = ["var(--color-chart-1)", "var(--color-chart-3)", "var(--color-chart-5)", "var(--color-chart-4)"]

export default function CapitalPie({ data }: { data: CapitalAccount[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="capital"
          nameKey="account_type"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          stroke="var(--color-card)"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "var(--color-popover)",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            color: "var(--color-popover-foreground)",
            textTransform: "capitalize",
          }}
          formatter={(value: number, name: string) => [formatCurrency(value), name]}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
