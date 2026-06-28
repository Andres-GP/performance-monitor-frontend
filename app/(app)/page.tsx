import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { EquityCard } from "@/components/dashboard/equity-card"
import { RecentAlerts } from "@/components/dashboard/recent-alerts"
import { RegimeCards } from "@/components/dashboard/regime-cards"

export default function DashboardPage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Resumen General</h2>
        <p className="text-sm text-muted-foreground">
          Estado actual de tu cartera de estrategias de trading
        </p>
      </div>

      <DashboardStats />
      <EquityCard />

      <div>
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">Régimen de Mercado Actual</h3>
        <RegimeCards />
      </div>

      <RecentAlerts />
    </div>
  )
}
