"use client"

import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { EquityCard } from "@/components/dashboard/equity-card"
import { RecentAlerts } from "@/components/dashboard/recent-alerts"
import { RegimeCards } from "@/components/dashboard/regime-cards"
import { useI18n } from "@/lib/i18n/context"

export default function DashboardPage() {
  const { dict } = useI18n()

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">{dict.dashboard.title}</h2>
        <p className="text-sm text-muted-foreground">{dict.dashboard.subtitle}</p>
      </div>

      <DashboardStats />
      <EquityCard />

      <div>
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">
          {dict.dashboard.currentRegime}
        </h3>
        <RegimeCards />
      </div>

      <RecentAlerts />
    </div>
  )
}
