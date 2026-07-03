"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { WelcomeMarquee } from "./WelcomeMarquee";

interface Rates {
  rate999: number;
  rate925: number;
  rate916: number;
  rate875: number;
  rate800: number;
}

interface DashboardShellProps {
  role: string;
  user: { name?: string | null; email?: string | null; role: string };
  rates: Rates | null;
  children: React.ReactNode;
}

export function DashboardShell({ role, user, rates, children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar role={role} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <WelcomeMarquee />
        <TopBar user={user} rates={rates} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
