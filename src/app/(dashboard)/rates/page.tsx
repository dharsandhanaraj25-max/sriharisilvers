"use client";

import { useState, useEffect } from "react";
import { formatDateTime } from "@/lib/utils";
import { useSession } from "next-auth/react";

interface SilverRate {
  id: string;
  date: string;
  rate999: number;
  rate925: number;
  rate916: number;
  rate875: number;
  rate800: number;
}

export default function RatesPage() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";
  const [latestRate, setLatestRate] = useState<SilverRate | null>(null);
  const [history, setHistory] = useState<SilverRate[]>([]);
  const [form, setForm] = useState({ rate999: "", rate925: "", rate916: "", rate875: "", rate800: "" });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  async function fetchRates() {
    const res = await fetch("/api/rates");
    const data = await res.json();
    setLatestRate(data.rate);
    setHistory(data.history || []);
    if (data.rate) {
      setForm({
        rate999: String(data.rate.rate999),
        rate925: String(data.rate.rate925),
        rate916: String(data.rate.rate916),
        rate875: String(data.rate.rate875),
        rate800: String(data.rate.rate800),
      });
    }
  }

  useEffect(() => { fetchRates(); }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    const res = await fetch("/api/rates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setSuccess(true);
      fetchRates();
      setTimeout(() => setSuccess(false), 3000);
    }
    setSaving(false);
  }

  const purities = [
    { key: "rate999", label: "999 Purity (Pure Silver)", sublabel: "100% silver" },
    { key: "rate925", label: "925 Purity (Sterling Silver)", sublabel: "92.5% silver" },
    { key: "rate916", label: "916 Purity", sublabel: "91.6% silver" },
    { key: "rate875", label: "875 Purity", sublabel: "87.5% silver" },
    { key: "rate800", label: "800 Purity", sublabel: "80% silver" },
  ];

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Silver Rates</h1>
        <p className="text-slate-500 text-sm mt-1">Manage daily silver market rates per gram</p>
      </div>

      {/* Current Rate Banner */}
      {latestRate && (
        <div className="bg-gradient-to-r from-amber-500 to-yellow-400 rounded-xl p-5 text-white shadow-md">
          <p className="text-amber-100 text-sm mb-3">Current Market Rates (per gram)</p>
          <div className="grid grid-cols-5 gap-4">
            {purities.map((p) => (
              <div key={p.key} className="text-center">
                <p className="text-amber-100 text-xs">{p.key.replace("rate", "")} Purity</p>
                <p className="text-2xl font-bold">₹{latestRate[p.key as keyof SilverRate]}</p>
              </div>
            ))}
          </div>
          <p className="text-amber-200 text-xs mt-3">
            Last updated: {formatDateTime(latestRate.date)}
          </p>
        </div>
      )}

      {/* Update Form (Admin only) */}
      {isAdmin && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h2 className="font-semibold text-slate-800 mb-5">Update Today's Rates</h2>
          <form onSubmit={handleSave}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {purities.map((p) => (
                <div key={p.key}>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{p.label}</label>
                  <p className="text-xs text-slate-400 mb-1">{p.sublabel}</p>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={form[p.key as keyof typeof form]}
                      onChange={(e) => setForm({ ...form, [p.key]: e.target.value })}
                      required
                      className="w-full pl-7 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">/g</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center gap-4">
              <button type="submit" disabled={saving}
                className="bg-amber-500 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-amber-600 disabled:opacity-70 shadow-sm">
                {saving ? "Updating..." : "Update Rates"}
              </button>
              {success && (
                <span className="text-emerald-600 text-sm font-medium flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Rates updated successfully!
                </span>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Rate History */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Rate History (Last 30 Days)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Date</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500">999</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500">925</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500">916</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500">875</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500">800</th>
              </tr>
            </thead>
            <tbody>
              {history.map((r, i) => (
                <tr key={r.id} className={`border-b border-slate-50 ${i === 0 ? "bg-amber-50" : ""}`}>
                  <td className="px-5 py-2.5">
                    <span className="text-slate-800">{new Date(r.date).toLocaleDateString("en-IN")}</span>
                    {i === 0 && <span className="ml-2 text-xs bg-amber-200 text-amber-700 px-1.5 py-0.5 rounded-full">Current</span>}
                  </td>
                  <td className="px-5 py-2.5 text-right font-semibold text-amber-700">₹{r.rate999}</td>
                  <td className="px-5 py-2.5 text-right text-slate-700">₹{r.rate925}</td>
                  <td className="px-5 py-2.5 text-right text-slate-700">₹{r.rate916}</td>
                  <td className="px-5 py-2.5 text-right text-slate-700">₹{r.rate875}</td>
                  <td className="px-5 py-2.5 text-right text-slate-700">₹{r.rate800}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
