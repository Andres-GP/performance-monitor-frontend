"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import { brandIcon as BrandIcon, navItems } from "./nav-items";

export function SidebarNav({ onNavigate, expanded = false }: { onNavigate?: () => void; expanded?: boolean }) {
  const pathname = usePathname();
  const { dict } = useI18n();

  return (
    <div className={expanded ? "sidebar-expanded flex h-full flex-col gap-2 px-2 py-5" : "sidebar-rail-inner flex h-full flex-col gap-2 px-2 py-5"}>
      <div className="sidebar-brand flex items-center gap-3 px-1 py-2">
        <span className="sidebar-brand-icon flex size-10 shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br from-[#ddffc1] via-[#c8f5a8] to-[#a7df83] text-[#14231a] shadow-[0_8px_26px_rgba(200,245,168,0.14)]">
          <BrandIcon className="size-5" strokeWidth={1.8} />
        </span>
        <div className="sidebar-brand-label flex min-w-0 flex-col">
          <span className="text-[14px] font-semibold leading-tight tracking-tight">
            {dict.sidebar.brandTop}
          </span>
          <span className="text-[13px] font-medium leading-tight text-[#91a49a]">
            {dict.sidebar.brandBottom}
          </span>
        </div>
      </div>

      <div className="sidebar-divider mx-1 mb-3 mt-2 h-px bg-gradient-to-r from-[#c8f5a8]/20 via-white/[0.07] to-transparent" />

      <nav
        className="sidebar-links flex flex-1 flex-col gap-1 px-0.5"
        aria-label={dict.nav.main}
      >
        {navItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              aria-label={dict.nav[item.labelKey]}
              className={cn(
                "nav-link",
                "group relative flex min-h-10 items-center gap-3 rounded-[11px] px-3 py-[10px] text-[13px] font-medium transition-all duration-200",
                active
                  ? "bg-[#c8f5a8]/[0.085] text-[#d7f9c2] shadow-[inset_0_0_0_1px_rgba(200,245,168,0.11)] before:absolute before:bottom-2 before:left-0 before:top-2 before:w-[2px] before:rounded-full before:bg-[#c8f5a8]"
                  : "text-[#91a49a] hover:bg-white/[0.04] hover:text-[#edf4ef]",
              )}
            >
              <Icon className="size-[17px] shrink-0 opacity-85 group-hover:opacity-100" />
              <span className="nav-link-label">{dict.nav[item.labelKey]}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer mx-1 mt-4 border-t border-sidebar-border px-2 pt-4 text-[10px] leading-relaxed text-[#778a7e]">
        {dict.sidebar.footer}
      </div>
    </div>
  );
}
