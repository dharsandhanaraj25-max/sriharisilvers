"use client";

import { useState, useEffect, useMemo } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

type ReportType = "sales" | "gst" | "stock" | "profit";

const CHART_COLORS = ["#800020", "#1e293b", "#0f766e", "#c2410c", "#1d4ed8", "#7c3aed"];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportType>("sales");
  const [from, setFrom] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split("T")[0];
  });
  const [to, setTo] = useState(() => new Date().toISOString().split("T")[0]);
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  async function fetchReport() {
    setLoading(true);
    const res = await fetch(`/api/reports?type=${activeTab}&from=${from}&to=${to}`);
    setData(await res.json());
    setLoading(false);
  }

  useEffect(() => { fetchReport(); }, [activeTab, from, to]);

  const tabs = [
    { id: "sales" as ReportType, label: "Sales Report" },
    { id: "gst" as ReportType, label: "GST Report" },
    { id: "stock" as ReportType, label: "Stock Report" },
    { id: "profit" as ReportType, label: "P&L Report" },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Reports</h1>
        <p className="text-slate-500 text-sm mt-1">Business analytics and GST compliance reports</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-white rounded-xl shadow-sm border border-slate-100 p-1.5 w-fit">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === t.id
                ? "bg-burgundy-500 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Date Range */}
      {activeTab !== "stock" && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex items-center gap-4">
          <span className="text-sm text-slate-600 font-medium">Period:</span>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-burgundy-400" />
          <span className="text-slate-400">to</span>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-burgundy-400" />
          <button onClick={() => window.print()}
            className="ml-auto flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <svg className="w-6 h-6 animate-spin text-burgundy-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : !data ? null : (
        <>
          {/* Sales Report */}
          {activeTab === "sales" && <SalesReportView data={data} />}
          {/* GST Report */}
          {activeTab === "gst" && <GSTReportView data={data} />}
          {/* Stock Report */}
          {activeTab === "stock" && <StockReportView data={data} />}
          {/* P&L */}
          {activeTab === "profit" && <ProfitReportView data={data} />}
        </>
      )}
    </div>
  );
}

function SalesReportView({ data }: { data: Record<string, unknown> }) {
  const d = data as {
    summary: { totalBills: number; totalAmount: number; totalGST: number; totalDiscount: number; totalWeight: number };
    sales: { id: string; billNumber: string; saleDate: string; customer: { name: string; phone: string } | null; total: number; gstAmount: number; paymentMode: string; items: { netWeight: number }[] }[];
  };

  // Daily sales trend
  const dailyData = useMemo(() => {
    const map: Record<string, number> = {};
    (d.sales || []).forEach((s) => {
      const day = s.saleDate.split("T")[0];
      map[day] = (map[day] || 0) + s.total;
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).map(([date, amount]) => ({
      date: date.slice(5), // MM-DD for display
      amount: Math.round(amount),
    }));
  }, [d.sales]);

  // Payment mode breakdown
  const paymentData = useMemo(() => {
    const map: Record<string, number> = {};
    (d.sales || []).forEach((s) => { map[s.paymentMode] = (map[s.paymentMode] || 0) + s.total; });
    return Object.entries(map).map(([name, value]) => ({ name, value: Math.round(value) }));
  }, [d.sales]);

  return (
    <div className="space-y-5">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Bills", value: String(d.summary?.totalBills || 0), color: "text-slate-800" },
          { label: "Total Revenue", value: formatCurrency(d.summary?.totalAmount || 0), color: "text-green-700" },
          { label: "Total GST", value: formatCurrency(d.summary?.totalGST || 0), color: "text-blue-600" },
          { label: "Total Weight Sold", value: `${(d.summary?.totalWeight || 0).toFixed(3)}g`, color: "text-burgundy-600" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <p className="text-sm text-slate-500">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Line chart — daily sales */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <h3 className="font-semibold text-slate-700 mb-4">Daily Sales Trend</h3>
          {dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={dailyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => formatCurrency(v as number)} labelFormatter={(l) => `Date: ${l}`} />
                <Line type="monotone" dataKey="amount" stroke="#800020" strokeWidth={2} dot={{ fill: "#800020", r: 3 }} name="Sales" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-40 text-slate-400 text-sm">No data for selected period</div>
          )}
        </div>

        {/* Pie chart — payment modes */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <h3 className="font-semibold text-slate-700 mb-4">Revenue by Payment Mode</h3>
          {paymentData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={paymentData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${percent != null ? (percent * 100).toFixed(0) : 0}%`} labelLine={false}>
                  {paymentData.map((_, idx) => (
                    <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(v as number)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-40 text-slate-400 text-sm">No data for selected period</div>
          )}
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Bill No</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Date</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Customer</th>
              <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500">Mode</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500">GST</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500">Total</th>
            </tr>
          </thead>
          <tbody>
            {d.sales?.map(s => (
              <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="px-5 py-2.5 text-burgundy-600 font-medium">{s.billNumber}</td>
                <td className="px-5 py-2.5 text-slate-500">{formatDate(s.saleDate)}</td>
                <td className="px-5 py-2.5 text-slate-700">{s.customer?.name || "Walk-in"}</td>
                <td className="px-5 py-2.5 text-center text-xs text-slate-500">{s.paymentMode}</td>
                <td className="px-5 py-2.5 text-right text-blue-600">{formatCurrency(s.gstAmount)}</td>
                <td className="px-5 py-2.5 text-right font-semibold text-slate-800">{formatCurrency(s.total)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-50 border-t border-slate-200">
            <tr>
              <td colSpan={4} className="px-5 py-3 font-semibold text-slate-700">Total</td>
              <td className="px-5 py-3 text-right font-bold text-blue-600">{formatCurrency(d.summary?.totalGST || 0)}</td>
              <td className="px-5 py-3 text-right font-bold text-slate-800">{formatCurrency(d.summary?.totalAmount || 0)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function GSTReportView({ data }: { data: Record<string, unknown> }) {
  const d = data as {
    summary: { totalTaxableValue: number; totalCGST: number; totalSGST: number; totalGST: number };
    rows: { id: string; billNumber: string; saleDate: string; customer: { name: string } | null; taxableValue: number; cgst: number; sgst: number; total: number }[];
  };
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <p className="text-xs text-slate-500">Taxable Value</p>
          <p className="text-xl font-bold text-slate-800 mt-1">{formatCurrency(d.summary?.totalTaxableValue || 0)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-5">
          <p className="text-xs text-slate-500">CGST (1.5%)</p>
          <p className="text-xl font-bold text-blue-600 mt-1">{formatCurrency(d.summary?.totalCGST || 0)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-indigo-100 p-5">
          <p className="text-xs text-slate-500">SGST (1.5%)</p>
          <p className="text-xl font-bold text-indigo-600 mt-1">{formatCurrency(d.summary?.totalSGST || 0)}</p>
        </div>
        <div className="bg-burgundy-50 rounded-xl shadow-sm border border-burgundy-200 p-5">
          <p className="text-xs text-burgundy-700">Total GST to Pay</p>
          <p className="text-xl font-bold text-burgundy-700 mt-1">{formatCurrency(d.summary?.totalGST || 0)}</p>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <p className="text-sm font-medium text-slate-700">GSTR-1 Data Export (HSN: 71131100 | GST Rate: 3%)</p>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Bill No</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Date</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Customer</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500">Taxable</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500">CGST 1.5%</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500">SGST 1.5%</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500">Total</th>
            </tr>
          </thead>
          <tbody>
            {d.rows?.map(r => (
              <tr key={r.id} className="border-b border-slate-50">
                <td className="px-5 py-2.5 text-burgundy-600">{r.billNumber}</td>
                <td className="px-5 py-2.5 text-slate-500">{formatDate(r.saleDate)}</td>
                <td className="px-5 py-2.5 text-slate-700">{r.customer?.name || "B2C"}</td>
                <td className="px-5 py-2.5 text-right">{formatCurrency(r.taxableValue)}</td>
                <td className="px-5 py-2.5 text-right text-blue-600">{formatCurrency(r.cgst)}</td>
                <td className="px-5 py-2.5 text-right text-indigo-600">{formatCurrency(r.sgst)}</td>
                <td className="px-5 py-2.5 text-right font-semibold">{formatCurrency(r.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StockReportView({ data }: { data: Record<string, unknown> }) {
  const d = data as {
    products: { id: string; name: string; purity: string; grossWeight: number; netWeight: number; currentStock: number; faultyStock?: number; minStock: number; makingChargeType: string; makingChargeValue: number; category: { name: string } }[];
  };
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <p className="text-sm font-medium text-slate-700">Stock Register — All Products</p>
        <button onClick={() => window.print()} className="text-xs text-burgundy-600 hover:text-burgundy-700 font-medium">Print Report</button>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-slate-50 border-b border-slate-100">
          <tr>
            <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Product</th>
            <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Category</th>
            <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500">Purity</th>
            <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500">Net Wt</th>
            <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500">Good Stock</th>
            <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500">Faulty</th>
            <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500">Status</th>
          </tr>
        </thead>
        <tbody>
          {d.products?.map(p => (
            <tr key={p.id} className="border-b border-slate-50">
              <td className="px-5 py-2.5 font-medium text-slate-800">{p.name}</td>
              <td className="px-5 py-2.5 text-slate-500">{p.category.name}</td>
              <td className="px-5 py-2.5 text-center text-xs font-semibold text-burgundy-700">{p.purity}</td>
              <td className="px-5 py-2.5 text-right text-slate-700">{p.netWeight.toFixed(3)}g</td>
              <td className="px-5 py-2.5 text-right font-semibold text-slate-800">{p.currentStock}</td>
              <td className="px-5 py-2.5 text-right text-red-600 font-medium">{p.faultyStock || 0}</td>
              <td className="px-5 py-2.5 text-center">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  p.currentStock <= 0 ? "bg-red-100 text-red-700" :
                  p.currentStock <= p.minStock ? "bg-orange-100 text-orange-700" :
                  "bg-green-100 text-green-700"
                }`}>
                  {p.currentStock <= 0 ? "Out of Stock" : p.currentStock <= p.minStock ? "Low Stock" : "In Stock"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProfitReportView({ data }: { data: Record<string, unknown> }) {
  const d = data as {
    revenue: number; cost: number; expenses: number;
    grossProfit: number; netProfit: number; gstCollected: number;
  };

  const barData = [
    { name: "Revenue", value: Math.round(d.revenue || 0) },
    { name: "Cost", value: Math.round(d.cost || 0) },
    { name: "Expenses", value: Math.round(d.expenses || 0) },
    { name: "Net Profit", value: Math.round(d.netProfit || 0) },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: "Revenue (excl. GST)", value: formatCurrency(d.revenue || 0), color: "text-green-700", bg: "bg-green-50 border-green-200" },
          { label: "Purchase Cost", value: formatCurrency(d.cost || 0), color: "text-red-600", bg: "bg-red-50 border-red-200" },
          { label: "Expenses", value: formatCurrency(d.expenses || 0), color: "text-orange-600", bg: "bg-orange-50 border-orange-200" },
          { label: "Gross Profit", value: formatCurrency(d.grossProfit || 0), color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
          { label: "Net Profit", value: formatCurrency(d.netProfit || 0), color: (d.netProfit || 0) >= 0 ? "text-green-700" : "text-red-600", bg: "bg-burgundy-50 border-burgundy-200" },
          { label: "GST Collected", value: formatCurrency(d.gstCollected || 0), color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-200" },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border p-5 ${s.bg}`}>
            <p className="text-sm text-slate-600">{s.label}</p>
            <p className={`text-2xl font-bold mt-2 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
        <h3 className="font-semibold text-slate-700 mb-4">Revenue vs Cost vs Profit</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={barData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} />
            <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v) => formatCurrency(v as number)} />
            <Bar dataKey="value" fill="#800020" radius={[4, 4, 0, 0]}>
              {barData.map((entry, idx) => (
                <Cell key={idx} fill={entry.name === "Net Profit" && entry.value < 0 ? "#dc2626" : CHART_COLORS[idx % CHART_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* P&L Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h3 className="font-semibold text-slate-800 mb-4">P&L Summary</h3>
        <div className="space-y-2 max-w-sm">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Revenue (excl. GST)</span>
            <span className="font-medium text-green-600">+ {formatCurrency(d.revenue || 0)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Less: Purchase Cost</span>
            <span className="font-medium text-red-600">- {formatCurrency(d.cost || 0)}</span>
          </div>
          <div className="flex justify-between text-sm border-t border-slate-100 pt-2">
            <span className="font-semibold text-slate-700">Gross Profit</span>
            <span className="font-bold text-blue-600">{formatCurrency(d.grossProfit || 0)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Less: Expenses</span>
            <span className="font-medium text-orange-600">- {formatCurrency(d.expenses || 0)}</span>
          </div>
          <div className="flex justify-between text-base border-t-2 border-slate-800 pt-2 mt-2">
            <span className="font-bold text-slate-800">Net Profit</span>
            <span className={`font-bold text-xl ${(d.netProfit || 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(d.netProfit || 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
