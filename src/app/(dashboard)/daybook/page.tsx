"use client";

import { useState, useEffect, useCallback } from "react";
import { formatCurrency } from "@/lib/utils";

interface DayBookSale {
  id: string;
  billNumber: string;
  createdAt: string;
  customer: { name: string; phone: string } | null;
  total: number;
  gstAmount: number;
  paymentMode: string;
  items: { itemName: string; netWeight: number; quantity: number }[];
  createdBy: { name: string };
}

interface DayBookExpense {
  id: string;
  category: string;
  description: string;
  amount: number;
  paymentMode: string;
  date: string;
}

interface DayBookSummary {
  totalBills: number;
  totalRevenue: number;
  totalGSTCollected: number;
  totalExpenses: number;
  totalPurchased: number;
  totalWeightSold: number;
  netCash: number;
  paymentBreakdown: Record<string, number>;
}

const MODE_LABEL: Record<string, string> = {
  CASH: "Cash",
  UPI: "UPI / GPay",
  CARD: "Card",
  CHEQUE: "Cheque",
  CREDIT: "Credit",
  MULTIPLE: "Split",
};

export default function DayBookPage() {
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [data, setData] = useState<{ sales: DayBookSale[]; expenses: DayBookExpense[]; summary: DayBookSummary } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDayBook = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/daybook?date=${date}`);
      setData(await res.json());
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => { fetchDayBook(); }, [fetchDayBook]);

  const isToday = date === new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Day Book</h1>
          <p className="text-sm text-slate-500 mt-0.5">Complete daily ledger — cash, sales, expenses</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-burgundy-400"
          />
          {!isToday && (
            <button onClick={() => setDate(new Date().toISOString().split("T")[0])}
              className="text-xs text-burgundy-600 hover:underline font-medium">
              Today
            </button>
          )}
          <button onClick={() => window.print()}
            className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <svg className="w-6 h-6 animate-spin text-burgundy-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : data ? (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
              <p className="text-xs text-slate-500">Total Bills</p>
              <p className="text-3xl font-bold text-slate-800 mt-1">{data.summary.totalBills}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
              <p className="text-xs text-slate-500">Total Revenue</p>
              <p className="text-2xl font-bold text-green-700 mt-1">{formatCurrency(data.summary.totalRevenue)}</p>
              <p className="text-xs text-slate-400 mt-0.5">GST: {formatCurrency(data.summary.totalGSTCollected)}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
              <p className="text-xs text-slate-500">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{formatCurrency(data.summary.totalExpenses)}</p>
            </div>
            <div className={`rounded-xl shadow-sm border p-5 ${data.summary.netCash >= 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
              <p className="text-xs text-slate-500">Net Cash in Hand</p>
              <p className={`text-2xl font-bold mt-1 ${data.summary.netCash >= 0 ? "text-green-700" : "text-red-600"}`}>
                {formatCurrency(data.summary.netCash)}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Cash sales − expenses</p>
            </div>
          </div>

          {/* Payment mode breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <h2 className="font-semibold text-slate-700 mb-4">Collections by Payment Mode</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {Object.entries(data.summary.paymentBreakdown).map(([mode, amount]) => (
                <div key={mode} className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{MODE_LABEL[mode] || mode}</p>
                  <p className="text-base font-bold text-slate-800 mt-1">{formatCurrency(amount)}</p>
                </div>
              ))}
              {Object.keys(data.summary.paymentBreakdown).length === 0 && (
                <div className="col-span-6 text-center text-slate-400 py-4 text-sm">No sales recorded</div>
              )}
            </div>
            <div className="mt-3 flex justify-between text-sm border-t border-slate-100 pt-3">
              <span className="text-slate-500">Weight Sold</span>
              <span className="font-semibold text-slate-700">{data.summary.totalWeightSold.toFixed(3)} g</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Sales ledger */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-semibold text-slate-700">Sales Ledger</h2>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                  {data.summary.totalBills} bills
                </span>
              </div>
              <div className="divide-y divide-slate-50 max-h-96 overflow-y-auto">
                {data.sales.length === 0 ? (
                  <p className="text-center text-slate-400 py-10 text-sm">No sales for this date</p>
                ) : data.sales.map((s, idx) => (
                  <div key={s.id} className="px-5 py-3 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400 w-5 text-right">{idx + 1}</span>
                        <div>
                          <a href={`/billing/${s.id}`} className="font-mono text-sm font-semibold text-burgundy-600 hover:underline">
                            #{s.billNumber}
                          </a>
                          <p className="text-xs text-slate-500">
                            {s.customer?.name || "Walk-in"} · {new Date(s.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-800">{formatCurrency(s.total)}</p>
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{MODE_LABEL[s.paymentMode] || s.paymentMode}</span>
                      </div>
                    </div>
                    <div className="ml-8 mt-1 text-xs text-slate-400">
                      {s.items.map((i) => i.itemName).join(", ")}
                    </div>
                  </div>
                ))}
              </div>
              {data.sales.length > 0 && (
                <div className="px-5 py-3 bg-green-50 border-t border-green-100 flex justify-between text-sm">
                  <span className="font-semibold text-green-800">Total Revenue</span>
                  <span className="font-bold text-green-700">{formatCurrency(data.summary.totalRevenue)}</span>
                </div>
              )}
            </div>

            {/* Expenses ledger */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-semibold text-slate-700">Expenses Ledger</h2>
                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">
                  {data.expenses.length} entries
                </span>
              </div>
              <div className="divide-y divide-slate-50 max-h-96 overflow-y-auto">
                {data.expenses.length === 0 ? (
                  <p className="text-center text-slate-400 py-10 text-sm">No expenses for this date</p>
                ) : data.expenses.map((e, idx) => (
                  <div key={e.id} className="px-5 py-3 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400 w-5 text-right">{idx + 1}</span>
                        <div>
                          <p className="text-sm font-medium text-slate-700">{e.description}</p>
                          <p className="text-xs text-slate-400">{e.category} · {MODE_LABEL[e.paymentMode] || e.paymentMode}</p>
                        </div>
                      </div>
                      <p className="font-semibold text-red-600">{formatCurrency(e.amount)}</p>
                    </div>
                  </div>
                ))}
              </div>
              {data.expenses.length > 0 && (
                <div className="px-5 py-3 bg-red-50 border-t border-red-100 flex justify-between text-sm">
                  <span className="font-semibold text-red-800">Total Expenses</span>
                  <span className="font-bold text-red-600">{formatCurrency(data.summary.totalExpenses)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Day closure summary box — print-ready */}
          <div className="bg-slate-800 text-white rounded-xl p-6 print:border print:border-slate-800 print:bg-white print:text-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">Day Closure Summary</h2>
              <span className="text-slate-400 text-sm">{new Date(date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
              <div className="flex justify-between border-b border-slate-700 pb-1">
                <span className="text-slate-400">Opening Balance</span>
                <span>₹ 0.00</span>
              </div>
              <div className="flex justify-between border-b border-slate-700 pb-1">
                <span className="text-slate-400">Bills Raised</span>
                <span>{data.summary.totalBills}</span>
              </div>
              {Object.entries(data.summary.paymentBreakdown).map(([mode, amt]) => (
                <div key={mode} className="flex justify-between border-b border-slate-700 pb-1">
                  <span className="text-slate-400">{MODE_LABEL[mode] || mode} Collected</span>
                  <span className="text-green-300">{formatCurrency(amt)}</span>
                </div>
              ))}
              <div className="flex justify-between border-b border-slate-700 pb-1">
                <span className="text-slate-400">GST Collected</span>
                <span className="text-blue-300">{formatCurrency(data.summary.totalGSTCollected)}</span>
              </div>
              <div className="flex justify-between border-b border-slate-700 pb-1">
                <span className="text-slate-400">Expenses Paid</span>
                <span className="text-red-300">- {formatCurrency(data.summary.totalExpenses)}</span>
              </div>
              <div className="col-span-2 flex justify-between pt-2 text-lg font-bold">
                <span>Closing Cash Balance</span>
                <span className={data.summary.netCash >= 0 ? "text-green-400" : "text-red-400"}>
                  {formatCurrency(data.summary.netCash)}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-4">Srihari Silvers · Salem · Closed by: _____________ · Signature: _____________</p>
          </div>
        </>
      ) : null}
    </div>
  );
}
