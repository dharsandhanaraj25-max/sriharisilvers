"use client";

import { useState, useEffect } from "react";
import { formatCurrency, EXPENSE_CATEGORIES } from "@/lib/utils";

interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  paymentMode: string;
  createdBy: { name: string };
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category: "", description: "", amount: "", date: new Date().toISOString().split("T")[0], paymentMode: "CASH", notes: "" });
  const [saving, setSaving] = useState(false);
  const [from, setFrom] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]);
  const [to, setTo] = useState(() => new Date().toISOString().split("T")[0]);

  async function fetchExpenses() {
    setLoading(true);
    const res = await fetch(`/api/expenses?from=${from}&to=${to}`);
    setExpenses(await res.json());
    setLoading(false);
  }

  useEffect(() => { fetchExpenses(); }, [from, to]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/expenses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false);
    setShowForm(false);
    setForm({ category: "", description: "", amount: "", date: new Date().toISOString().split("T")[0], paymentMode: "CASH", notes: "" });
    fetchExpenses();
  }

  const totalAmount = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Expenses</h1>
          <p className="text-slate-500 text-sm mt-1">Track shop operational expenses</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Expense
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h2 className="font-semibold text-slate-800 mb-4">Record Expense</h2>
          <form onSubmit={handleAdd}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-600 mb-1">Category *</label>
                <select value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                  <option value="">Select category</option>
                  {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Amount (₹) *</label>
                <input type="number" step="0.01" min="0" value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})} required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm text-slate-600 mb-1">Description *</label>
                <input type="text" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Date *</label>
                <input type="date" value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Payment Mode</label>
                <select value={form.paymentMode} onChange={(e) => setForm({...form, paymentMode: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                  <option value="CASH">Cash</option>
                  <option value="CARD">Card</option>
                  <option value="UPI">UPI</option>
                  <option value="CHEQUE">Cheque</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button type="submit" disabled={saving} className="bg-amber-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-amber-600 disabled:opacity-70">{saving ? "Saving..." : "Record Expense"}</button>
              <button type="button" onClick={() => setShowForm(false)} className="border border-slate-300 text-slate-600 px-4 py-2.5 rounded-lg text-sm hover:bg-slate-50">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Date Filter + Total */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex flex-wrap items-center gap-3">
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
        <span className="text-slate-400">to</span>
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
        <div className="w-full sm:w-auto sm:ml-auto bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
          <p className="text-xs text-amber-600">Total Expenses</p>
          <p className="font-bold text-amber-800">{formatCurrency(totalAmount)}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Date</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Category</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Description</th>
              <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500">Mode</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Added By</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500">Amount</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-12 text-slate-400">Loading...</td></tr>
            ) : expenses.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-slate-400">No expenses recorded</td></tr>
            ) : (
              expenses.map((e) => (
                <tr key={e.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-5 py-3 text-slate-500">{new Date(e.date).toLocaleDateString("en-IN")}</td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">{e.category}</span>
                  </td>
                  <td className="px-5 py-3 text-slate-700">{e.description}</td>
                  <td className="px-5 py-3 text-center text-xs text-slate-500">{e.paymentMode}</td>
                  <td className="px-5 py-3 text-slate-500 text-xs">{e.createdBy.name}</td>
                  <td className="px-5 py-3 text-right font-semibold text-red-600">{formatCurrency(e.amount)}</td>
                </tr>
              ))
            )}
          </tbody>
          {expenses.length > 0 && (
            <tfoot className="bg-slate-50 border-t border-slate-200">
              <tr>
                <td colSpan={5} className="px-5 py-3 text-sm font-semibold text-slate-700">Total</td>
                <td className="px-5 py-3 text-right font-bold text-red-600">{formatCurrency(totalAmount)}</td>
              </tr>
            </tfoot>
          )}
        </table>
        </div>
      </div>
    </div>
  );
}
