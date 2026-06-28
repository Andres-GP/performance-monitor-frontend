"use client"

import { Menu } from "lucide-react"
import { usePathname } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { navItems } from "./nav-items"
import { SidebarNav } from "./sidebar-nav"

function useTitle() {
  const pathname = usePathname()
  if (pathname.startsWith("/strategies/")) return "Detalle de Estrategia"
  const match = navItems.find((i) =>
    i.href === "/" ? pathname === "/" : pathname.startsWith(i.href),
  )
  return match?.label ?? "Performance Monitor"
}

export function Header() {
  const title = useTitle()

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur md:px-6">
      <Sheet>
        <SheetTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Abrir menú de navegación"
            />
          }
        >
          <Menu className="size-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-72 bg-sidebar p-0">
          <SheetTitle className="sr-only">Navegación</SheetTitle>
          <SidebarNav />
        </SheetContent>
      </Sheet>

      <h1 className="text-base font-semibold md:text-lg">{title}</h1>

      <div className="ml-auto flex items-center gap-3">
        <span className="hidden text-sm text-muted-foreground sm:inline">Trader</span>
        <Avatar className="size-9">
          <AvatarFallback className="bg-primary/15 text-primary">TR</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
