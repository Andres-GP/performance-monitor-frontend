import {
  Activity,
  Bell,
  Gauge,
  LineChart,
  Settings,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export interface NavItem {
  /** Key into dict.nav used to resolve the translated label. */
  labelKey: keyof Dictionary["nav"];
  href: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { labelKey: "strategies", href: "/", icon: LineChart },
  { labelKey: "portfolio", href: "/portfolio", icon: Wallet },
  { labelKey: "marketRegime", href: "/market-regime", icon: Gauge },
  { labelKey: "alerts", href: "/alerts", icon: Bell },
  { labelKey: "settings", href: "/settings", icon: Settings },
];

export const brandIcon = Activity;
