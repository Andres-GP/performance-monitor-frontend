"use client";

import type { ReactNode } from "react";
import { Header } from "@/components/layout/header";
import { SidebarNav } from "@/components/layout/sidebar-nav";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell relative min-h-svh md:pl-[4.5rem]">
      <div className="flex min-h-svh min-w-0 flex-col">
        <Header />
        <main className="relative z-0 w-full flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-9">
          <div className="mx-auto w-full max-w-[1680px]">{children}</div>
        </main>
      </div>
      <aside className="app-sidebar-rail fixed inset-y-0 left-0 z-40 hidden border-r border-white/[0.07] md:block">
        <SidebarNav />
      </aside>
    </div>
  );
}
