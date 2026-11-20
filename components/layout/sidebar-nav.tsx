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
    <div className="flex h-full flex-col gap-2 px-4 py-6">
      <div className="flex items-center gap-3 px-2 py-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#c8f5a8] text-[#1f3d36] shadow-[0_8px_28px_rgba(200,245,168,0.17)]">
          <BrandIcon className="size-5" strokeWidth={1.8} />
        </span>
        <div className="flex min-w-0 flex-col">
          <span className="text-[15px] font-semibold leading-tight tracking-tight">
            {dict.sidebar.brandTop}
          </span>
          <span className="text-[15px] font-medium leading-tight text-[#adc5b7]">
            {dict.sidebar.brandBottom}
          </span>
        </div>
      </div>

      <div className="mx-2 mb-3 mt-1 h-px bg-gradient-to-r from-[#c8f5a8]/25 via-white/10 to-transparent" />

      <nav
        className="flex flex-1 flex-col gap-1.5 px-1"
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
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-medium transition-all duration-200",
                active
                  ? "bg-[#c8f5a8]/10 text-[#d7f9c2] shadow-[inset_0_0_0_1px_rgba(200,245,168,0.12)] before:absolute before:bottom-2 before:left-0 before:top-2 before:w-[3px] before:rounded-full before:bg-[#c8f5a8]"
                  : "text-[#adc5b7] hover:bg-white/[0.045] hover:text-[#f2f5ef]",
              )}
            >
              <Icon className="size-[17px] shrink-0 opacity-85 group-hover:opacity-100" />
              <span>{dict.nav[item.labelKey]}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mx-1 mt-4 border-t border-sidebar-border px-2 pt-4 text-[11px] leading-relaxed text-[#91aa9b]">
        {dict.sidebar.footer}
      </div>
    </div>
  );
}
