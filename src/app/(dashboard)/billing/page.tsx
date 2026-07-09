"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";

interface Sale {
  id: string;
  billNumber: string;
  saleDate: string;
  total: number;
  paymentMode: string;
  status: string;
  customer: { name: string; phone: string } | null;
  items: { itemName: string; netWeight: number }[];
  createdBy: { name: string };
}

const STATUS_TABS = [
  { label: "All Bills", value: "" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Voided", value: "VOID" },
  { label: "Refunded", value: "RETURNED,PARTIALLY_RETURNED" },
];

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  COMPLETED: { label: "Completed", className: "bg-emerald-100 text-emerald-700" },
  VOID: { label: "VOID", className: "bg-slate-200 text-slate-600" },
  RETURNED: { label: "REFUNDED", className: "bg-red-100 text-red-700" },
  PARTIALLY_RETURNED: { label: "PARTIAL REFUND", className: "bg-amber-100 text-amber-700" },
};

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  async function fetchSales() {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("search", search);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (status) params.set("status", status);
    const res = await fetch(`/api/sales?${params}`);
    const data = await res.json();
    setSales(data.sales || []);
    setTotal(data.total || 0);
    setLoading(false);
  }

  useEffect(() => { fetchSales(); }, [page, search, from, to, status]);

  const todayTotal = sales.filter(s => {
    const d = new Date(s.saleDate);
    const t = new Date();
    return d.toDateString() === t.toDateString() && s.status === "COMPLETED";
  }).reduce((a, s) => a + s.total, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Sales History</h1>
          <p className="text-slate-500 text-sm mt-1">{total} total bills</p>
        </div>
        <Link href="/billing/new" className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Bill
        </Link>
      </div>

      {/* Status tabs — voided and refunded bills get their own views */}
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setStatus(tab.value); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              status === tab.value
                ? "bg-burgundy-500 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search by bill no, customer name or phone..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 min-w-48 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
        <input
          type="date"
          value={from}
          onChange={(e) => { setFrom(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
        <input
          type="date"
          value={to}
          onChange={(e) => { setTo(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
        <button onClick={() => { setSearch(""); setFrom(""); setTo(""); setPage(1); }}
          className="px-3 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50">
          Clear
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Bill No.</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Customer</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Date & Time</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Items</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500">Mode</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500">Amount</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500">Status</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-50">
                    <td className="px-5 py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-5 py-4"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-5 py-4"><Skeleton className="h-4 w-28" /></td>
                    <td className="px-5 py-4"><Skeleton className="h-4 w-36" /></td>
                    <td className="px-5 py-4"><Skeleton className="h-5 w-14 rounded-full mx-auto" /></td>
                    <td className="px-5 py-4"><Skeleton className="h-4 w-20 ml-auto" /></td>
                    <td className="px-5 py-4"><Skeleton className="h-5 w-20 rounded-full mx-auto" /></td>
                    <td className="px-5 py-4"><Skeleton className="h-4 w-10 mx-auto" /></td>
                  </tr>
                ))
              ) : sales.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-slate-400">No sales found</td></tr>
              ) : (
                sales.map((sale) => (
                  <tr key={sale.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-amber-600">{sale.billNumber}</td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-800">{sale.customer?.name || "Walk-in"}</p>
                      {sale.customer?.phone && <p className="text-xs text-slate-400">{sale.customer.phone}</p>}
                    </td>
                    <td className="px-5 py-3 text-slate-500">{formatDateTime(sale.saleDate)}</td>
                    <td className="px-5 py-3 text-slate-500 text-xs">
                      {sale.items.slice(0, 2).map((i, idx) => (
                        <span key={idx} className="block">{i.itemName} ({i.netWeight.toFixed(2)}g)</span>
                      ))}
                      {sale.items.length > 2 && <span className="text-slate-400">+{sale.items.length - 2} more</span>}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                        {sale.paymentMode}
                      </span>
                    </td>
                    <td className={`px-5 py-3 text-right font-semibold ${
                      sale.status === "VOID" ? "text-slate-400 line-through" : "text-slate-800"
                    }`}>{formatCurrency(sale.total)}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        (STATUS_BADGES[sale.status] || STATUS_BADGES.COMPLETED).className
                      }`}>
                        {(STATUS_BADGES[sale.status] || { label: sale.status }).label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <Link href={`/billing/${sale.id}`} className="text-amber-600 hover:text-amber-700 font-medium text-xs">
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 20 && (
          <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
            <p className="text-sm text-slate-500">Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}</p>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 border border-slate-200 rounded text-sm disabled:opacity-40 hover:bg-slate-50">
                Previous
              </button>
              <button disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 border border-slate-200 rounded text-sm disabled:opacity-40 hover:bg-slate-50">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
