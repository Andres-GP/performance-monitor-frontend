"use client";

import { Menu, LogOut } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
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
  if (pathname.startsWith("/strategies/")) return dict.header.strategyDetail;
  const match = navItems.find((i) =>
    i.href === "/" ? pathname === "/" : pathname.startsWith(i.href),
  );
  return match ? dict.nav[match.labelKey] : dict.common.appName;
}

export function Header() {
  const { dict } = useI18n();
  const title = useTitle();
  const { signOut } = useClerk();
  const { user } = useUser();
  const router = useRouter();

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
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur md:px-6">
      <Sheet>
        <SheetTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label={dict.header.openMenu}
            />
          }
        >
          <Menu className="size-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-72 bg-sidebar p-0">
          <SheetTitle className="sr-only">{dict.header.navigation}</SheetTitle>
          <SidebarNav />
        </SheetContent>
      </Sheet>

      <h1 className="text-base font-semibold md:text-lg">{title}</h1>

      <div className="ml-auto flex items-center gap-3">
        <LanguageSelector />
        <span className="hidden text-sm text-muted-foreground sm:inline">
          {user?.firstName ||
            user?.emailAddresses?.[0]?.emailAddress ||
            dict.header.user}
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar className="size-9 cursor-pointer">
              <AvatarFallback className="bg-primary/15 text-primary">
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
