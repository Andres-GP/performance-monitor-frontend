import {
  Activity,
  Bell,
  ClipboardList,
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
  { labelKey: "portfolio", href: "/portfolio", icon: Wallet },
  { labelKey: "weeklyReview", href: "/weekly-review", icon: ClipboardList },
  { labelKey: "alerts", href: "/alerts", icon: Bell },
];

export const brandIcon = Activity;
