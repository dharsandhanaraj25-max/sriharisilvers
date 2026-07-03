"use client";

import { useState, useEffect } from "react";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import Link from "next/link";

interface Purchase {
  id: string;
  purchaseNumber: string;
  purchaseDate: string;
  total: number;
  silverRate: number;
  silverPurity: string;
  paymentMode: string;
  status: string;
  supplier: { name: string } | null;
  items: { itemName: string; netWeight: number }[];
  createdBy: { name: string };
}

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  async function fetchPurchases() {
    setLoading(true);
    const res = await fetch(`/api/purchases?page=${page}&limit=20`);
    const data = await res.json();
    setPurchases(data.purchases || []);
    setTotal(data.total || 0);
    setLoading(false);
  }

  useEffect(() => { fetchPurchases(); }, [page]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Purchase Register</h1>
          <p className="text-slate-500 text-sm mt-1">{total} total purchases</p>
        </div>
        <Link href="/purchases/new"
          className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          New Purchase
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Purchase No.</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Supplier</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Date</th>
              <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500">Purity</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500">Rate/g</th>
              <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500">Mode</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500">Total</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-12 text-slate-400">Loading...</td></tr>
            ) : purchases.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-slate-400">No purchases found</td></tr>
            ) : (
              purchases.map((p) => (
                <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-amber-600">{p.purchaseNumber}</td>
                  <td className="px-5 py-3 text-slate-700">{p.supplier?.name || "Direct"}</td>
                  <td className="px-5 py-3 text-slate-500">{formatDateTime(p.purchaseDate)}</td>
                  <td className="px-5 py-3 text-center">
                    <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{p.silverPurity}</span>
                  </td>
                  <td className="px-5 py-3 text-right text-slate-700">₹{p.silverRate}/g</td>
                  <td className="px-5 py-3 text-center text-xs text-slate-500">{p.paymentMode}</td>
                  <td className="px-5 py-3 text-right font-semibold text-slate-800">{formatCurrency(p.total)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
        {total > 20 && (
          <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
            <p className="text-sm text-slate-500">Showing {(page-1)*20+1}–{Math.min(page*20,total)} of {total}</p>
            <div className="flex gap-2">
              <button disabled={page===1} onClick={() => setPage(p=>p-1)} className="px-3 py-1.5 border border-slate-200 rounded text-sm disabled:opacity-40">Previous</button>
              <button disabled={page*20>=total} onClick={() => setPage(p=>p+1)} className="px-3 py-1.5 border border-slate-200 rounded text-sm disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
