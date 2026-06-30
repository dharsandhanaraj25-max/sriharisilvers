"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";
import { QuickCalculator } from "./QuickCalculator";

interface Rates {
  rate999: number;
  rate925: number;
  rate916: number;
  rate875: number;
  rate800: number;
}

interface TopBarProps {
  user: { name?: string | null; email?: string | null; role: string };
  rates: Rates | null;
}

export function TopBar({ user, rates }: TopBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm z-10">
      <div className="flex items-center gap-4">
        <p className="text-sm text-slate-500" suppressHydrationWarning>{today}</p>
        {rates && (
          <div className="hidden lg:flex items-center gap-3 text-xs text-slate-500 border-l border-slate-200 pl-4">
            <span className="font-medium text-slate-600">Silver:</span>
            <span className="font-semibold text-slate-700">999 ₹{rates.rate999}</span>
            <span>·</span>
            <span>925 ₹{rates.rate925}</span>
            <span>·</span>
            <span>916 ₹{rates.rate916}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Rate Calculator */}
        <QuickCalculator rates={rates} />

        {/* New Bill */}
        <a
          href="/billing/new"
          className="inline-flex items-center gap-2 bg-burgundy-500 hover:bg-burgundy-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Bill
        </a>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg transition-colors"
          >
            <div className="w-7 h-7 bg-slate-800 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {user.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-semibold text-slate-800">{user.name}</p>
              <p className="text-xs text-slate-500">{user.role}</p>
            </div>
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-20 py-1 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
                <a href="/daybook" className="block w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Day Book
                </a>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
