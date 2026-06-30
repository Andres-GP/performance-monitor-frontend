"use client"

import { Bell, LineChart, TrendingUp, Wallet } from "lucide-react"
import { StatCard } from "@/components/shared/stat-card"
import { formatCurrency, formatPercent } from "@/lib/format"
import { useI18n } from "@/lib/i18n/context"
import { useAlerts, useCapitalSummary, useStrategies } from "@/lib/queries"

export function DashboardStats() {
  const { dict } = useI18n()
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
        label={dict.dashboard.capitalTotal}
        value={formatCurrency(capital.data?.data.total)}
        icon={Wallet}
        hint={dict.dashboard.capitalHint}
        loading={capital.isLoading}
      />
      <StatCard
        label={dict.dashboard.activeStrategies}
        value={`${activeCount} / ${strategyList.length}`}
        icon={LineChart}
        hint={dict.dashboard.activeHint}
        trend="up"
        loading={strategies.isLoading}
      />
      <StatCard
        label={dict.dashboard.unreadAlerts}
        value={String(unreadAlerts)}
        icon={Bell}
        hint={dict.dashboard.unreadHint}
        trend={unreadAlerts > 0 ? "down" : "neutral"}
        loading={alerts.isLoading}
      />
      <StatCard
        label={dict.dashboard.avgWinRate}
        value={formatPercent(avgWinRate)}
        icon={TrendingUp}
        hint={dict.dashboard.avgWinRateHint}
        trend="up"
        loading={strategies.isLoading}
      />
    </div>
  )
}
