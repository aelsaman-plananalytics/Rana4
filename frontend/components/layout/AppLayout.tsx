"use client";

import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { PageTransition } from "./PageTransition";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-100 dark:bg-slate-950 md:flex-row">
      <AppSidebar />
      <div className="flex flex-1 flex-col bg-white dark:bg-slate-900 shadow-sm">
        <AppHeader />
        <main className="flex-1 p-6">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
