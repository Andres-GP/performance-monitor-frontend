"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import { brandIcon as BrandIcon, navItems } from "./nav-items";

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { dict } = useI18n();

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center gap-2 px-3 py-4">
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <BrandIcon className="size-5" />
        </span>
        <div className="flex flex-col">
          <span className="text-sm font-semibold leading-tight">
            {dict.sidebar.brandTop}
          </span>
          <span className="text-xs text-muted-foreground leading-tight">
            {dict.sidebar.brandBottom}
          </span>
        </div>
      </div>

      <nav
        className="flex flex-1 flex-col gap-1 px-2"
        aria-label={dict.nav.main}
      >
        {navItems.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/strategies"
              : pathname === item.href ||
                (item.href === "/strategies" && pathname === "/") || // <--- NUEVA CONDICIÓN
                pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span>{dict.nav[item.labelKey]}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border px-4 py-3 text-xs text-muted-foreground">
        {dict.sidebar.footer}
      </div>
    </div>
  );
}
