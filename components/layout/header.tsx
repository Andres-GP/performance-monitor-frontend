"use client";

import { Menu, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useI18n } from "@/lib/i18n/context";
import { LanguageSelector } from "./language-selector";
import { navItems } from "./nav-items";
import { SidebarNav } from "./sidebar-nav";
import { BackendStatus } from "./backend-status";
import { useClerk, useUser } from "@clerk/nextjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function useTitle() {
  const pathname = usePathname();
  const { dict } = useI18n();
  const match = navItems.find((i) =>
    pathname === i.href || pathname.startsWith(`${i.href}/`),
  );
  return match ? dict.nav[match.labelKey] : dict.common.appName;
}

export function Header() {
  const { dict } = useI18n();
  const title = useTitle();
  const { signOut } = useClerk();
  const { user } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    window.location.href = "/sign-in";
  };

  // Obtener iniciales del usuario
  const getInitials = () => {
    if (!user) return "?";
    const firstName = user.firstName || "";
    const lastName = user.lastName || "";
    if (firstName && lastName)
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    if (firstName) return firstName[0].toUpperCase();
    if (user.emailAddresses?.[0]?.emailAddress) {
      return user.emailAddresses[0].emailAddress[0].toUpperCase();
    }
    return "?";
  };

  return (
    <header className="app-header sticky top-0 z-30 flex h-[4.25rem] items-center gap-3 border-b border-white/[0.07] px-4 md:px-8">
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="size-10 rounded-xl border border-white/10 text-[#f2f5ef] hover:bg-white/[0.06] md:hidden"
              aria-label={dict.header.openMenu}
            />
          }
        >
          <Menu className="size-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-72 border-r border-white/10 bg-sidebar p-0">
          <SheetTitle className="sr-only">{dict.header.navigation}</SheetTitle>
          <SidebarNav expanded onNavigate={() => setMobileMenuOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="min-w-0">
        <p className="hidden text-[9px] font-semibold uppercase tracking-[0.18em] text-[#859a8e] md:block">
          Alphaca Capital
        </p>
        <h1 className="truncate text-[15px] font-semibold tracking-tight text-[#edf4ef] md:text-base">
          {title}
        </h1>
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <BackendStatus />
        <LanguageSelector />
        <span className="hidden max-w-36 truncate text-sm text-[#c2d2c8] lg:inline">
          {user?.firstName ||
            user?.emailAddresses?.[0]?.emailAddress ||
            dict.header.user}
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar className="user-menu-trigger size-8 cursor-pointer bg-[#c8f5a8]/[0.08] transition">
              <AvatarFallback className="bg-[#c8f5a8]/15 font-semibold text-[#c8f5a8]">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 size-4" />
              <span>{dict.header.closeSession}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
