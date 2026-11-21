"use client";

import type { ReactNode } from "react";
import { Header } from "@/components/layout/header";
import { SidebarNav } from "@/components/layout/sidebar-nav";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-svh">
      <aside className="relative z-20 hidden w-[17rem] shrink-0 border-r border-sidebar-border bg-sidebar md:block">
        <div className="sticky top-0 h-svh">
          <SidebarNav />
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="relative z-0 w-full flex-1 px-4 py-6 sm:px-6 lg:px-9 lg:py-8">
          <div className="app-content-enter mx-auto w-full max-w-[1600px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
