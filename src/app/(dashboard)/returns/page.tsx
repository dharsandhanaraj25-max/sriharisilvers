"use client";

import { useState, useEffect, useCallback } from "react";
import { formatCurrency } from "@/lib/utils";
import { CreditNoteView } from "@/components/billing/CreditNoteView";

interface ReturnItem {
  id: string;
  itemName: string;
  quantity: number;
  netWeight: number;
  refundAmount: number;
  restocked: boolean;
}

interface SaleReturn {
  id: string;
  returnNumber: string;
  returnDate: string;
  refundAmount: number;
  refundMode: string;
  reason: string;
  notes?: string;
  status: string;
  sale: {
    billNumber: string;
    customer: { name: string; phone: string } | null;
  };
  createdBy: { name: string };
  items: ReturnItem[];
}

const REFUND_MODE_LABELS: Record<string, string> = {
  CASH: "Cash",
  UPI: "UPI",
  BANK_TRANSFER: "Bank Transfer",
  CREDIT: "Store Credit",
};

export default function ReturnsPage() {
  const [returns, setReturns] = useState<SaleReturn[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewReturn, setViewReturn] = useState<SaleReturn | null>(null);

  const fetchReturns = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ page: String(page), search });
      const res = await fetch(`/api/returns?${q}`);
      const data = await res.json();
      setReturns(data.returns || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchReturns(); }, [fetchReturns]);
  useEffect(() => { setPage(1); }, [search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Returns & Refunds</h1>
          <p className="text-sm text-slate-500 mt-0.5">{total} total return{total !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
        <div className="relative max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by return no., bill no., reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <svg className="w-6 h-6 animate-spin text-amber-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : returns.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            <p className="font-medium">No returns found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Return No.</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Date</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Bill No.</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Customer</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Reason</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Refund Mode</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600">Refund Amt</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {returns.map((ret) => (
                <tr key={ret.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-mono font-semibold text-red-700">{ret.returnNumber}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {new Date(ret.returnDate).toLocaleDateString("en-IN")}
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={`/billing/${ret.sale?.billNumber}`}
                      className="text-amber-600 hover:underline font-medium"
                    >
                      #{ret.sale?.billNumber}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {ret.sale?.customer ? (
                      <div>
                        <p className="font-medium">{ret.sale.customer.name}</p>
                        <p className="text-xs text-slate-400">{ret.sale.customer.phone}</p>
                      </div>
                    ) : (
                      <span className="text-slate-400">Walk-in</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600 max-w-[160px] truncate" title={ret.reason}>{ret.reason}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                      {REFUND_MODE_LABELS[ret.refundMode] || ret.refundMode}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-red-700">
                    {formatCurrency(ret.refundAmount)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setViewReturn(ret)}
                      className="text-slate-500 hover:text-amber-600 p-1 rounded-lg hover:bg-amber-50 transition-colors"
                      title="View Credit Note"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                p === page ? "bg-amber-500 text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-amber-300"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Credit Note Modal */}
      {viewReturn && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 print:hidden">
              <h3 className="text-lg font-bold text-slate-800">Credit Note — {viewReturn.returnNumber}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 bg-slate-800 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print
                </button>
                <button onClick={() => setViewReturn(null)} className="text-slate-400 hover:text-slate-600 p-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              <CreditNoteView
                returnNumber={viewReturn.returnNumber}
                returnDate={viewReturn.returnDate}
                billNumber={viewReturn.sale.billNumber}
                customer={viewReturn.sale.customer}
                items={viewReturn.items}
                refundAmount={viewReturn.refundAmount}
                refundMode={viewReturn.refundMode}
                reason={viewReturn.reason}
                notes={viewReturn.notes}
                createdBy={viewReturn.createdBy.name}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
