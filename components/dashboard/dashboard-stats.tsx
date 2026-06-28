"use client"

import { Bell, LineChart, TrendingUp, Wallet } from "lucide-react"
import { StatCard } from "@/components/shared/stat-card"
import { formatCurrency, formatPercent } from "@/lib/format"
import { useAlerts, useCapitalSummary, useStrategies } from "@/lib/queries"

export function DashboardStats() {
  const capital = useCapitalSummary()
  const strategies = useStrategies()
  const alerts = useAlerts()

  const strategyList = strategies.data?.data ?? []
  const activeCount = strategyList.filter((s) => s.status === "Running").length
  const unreadAlerts = (alerts.data?.data ?? []).filter((a) => !a.read).length
  const avgWinRate =
    strategyList.length > 0
      ? strategyList.reduce((acc, s) => acc + (s.win_rate ?? 0), 0) / strategyList.length
      : 0

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Capital Total"
        value={formatCurrency(capital.data?.data.total)}
        icon={Wallet}
        hint="Todas las cuentas"
        loading={capital.isLoading}
      />
      <StatCard
        label="Estrategias Activas"
        value={`${activeCount} / ${strategyList.length}`}
        icon={LineChart}
        hint="En ejecución"
        trend="up"
        loading={strategies.isLoading}
      />
      <StatCard
        label="Alertas no Leídas"
        value={String(unreadAlerts)}
        icon={Bell}
        hint="Requieren atención"
        trend={unreadAlerts > 0 ? "down" : "neutral"}
        loading={alerts.isLoading}
      />
      <StatCard
        label="Win Rate Promedio"
        value={formatPercent(avgWinRate)}
        icon={TrendingUp}
        hint="Media de estrategias"
        trend="up"
        loading={strategies.isLoading}
      />
    </div>
  )
}
