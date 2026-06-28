import {
  Activity,
  Bell,
  Gauge,
  LayoutDashboard,
  LineChart,
  Settings,
  Wallet,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Estrategias", href: "/strategies", icon: LineChart },
  { label: "Portafolio", href: "/portfolio", icon: Wallet },
  { label: "Régimen de Mercado", href: "/market-regime", icon: Gauge },
  { label: "Alertas", href: "/alerts", icon: Bell },
  { label: "Ajustes", href: "/settings", icon: Settings },
]

export const brandIcon = Activity
