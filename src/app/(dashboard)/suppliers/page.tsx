"use client";

import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";

interface Supplier { id: string; name: string; phone: string; email: string | null; city: string | null; gstin: string | null; balance: number; }

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", city: "", gstin: "" });
  const [saving, setSaving] = useState(false);

  async function fetchSuppliers() {
    setLoading(true);
    const r = await fetch("/api/suppliers");
    setSuppliers(await r.json());
    setLoading(false);
  }

  useEffect(() => { fetchSuppliers(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/suppliers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false);
    setShowForm(false);
    setForm({ name: "", phone: "", email: "", address: "", city: "", gstin: "" });
    fetchSuppliers();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Suppliers</h1>
          <p className="text-slate-500 text-sm mt-1">{suppliers.length} registered suppliers</p>
        </div>
        <button onClick={() => setShowForm(true)} className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Supplier
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h2 className="font-semibold text-slate-800 mb-4">Add Supplier</h2>
          <form onSubmit={handleAdd}>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm text-slate-600 mb-1">Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" /></div>
              <div><label className="block text-sm text-slate-600 mb-1">Phone *</label>
                <input type="tel" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" /></div>
              <div><label className="block text-sm text-slate-600 mb-1">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" /></div>
              <div><label className="block text-sm text-slate-600 mb-1">City</label>
                <input type="text" value={form.city} onChange={(e) => setForm({...form, city: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" /></div>
              <div><label className="block text-sm text-slate-600 mb-1">GSTIN</label>
                <input type="text" value={form.gstin} onChange={(e) => setForm({...form, gstin: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" /></div>
              <div><label className="block text-sm text-slate-600 mb-1">Address</label>
                <input type="text" value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" /></div>
            </div>
            <div className="flex gap-3 mt-4">
              <button type="submit" disabled={saving} className="bg-amber-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-amber-600">{saving ? "Saving..." : "Add Supplier"}</button>
              <button type="button" onClick={() => setShowForm(false)} className="border border-slate-300 text-slate-600 px-4 py-2.5 rounded-lg text-sm hover:bg-slate-50">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Supplier</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Phone</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">City</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">GSTIN</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500">Balance</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={5} className="text-center py-12 text-slate-400">Loading...</td></tr>
              : suppliers.length === 0 ? <tr><td colSpan={5} className="text-center py-12 text-slate-400">No suppliers added</td></tr>
              : suppliers.map(s => (
                <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-5 py-3 font-semibold text-slate-800">{s.name}</td>
                  <td className="px-5 py-3 text-slate-600">{s.phone}</td>
                  <td className="px-5 py-3 text-slate-500">{s.city || "-"}</td>
                  <td className="px-5 py-3 text-slate-500 font-mono text-xs">{s.gstin || "-"}</td>
                  <td className="px-5 py-3 text-right font-medium text-slate-800">{formatCurrency(s.balance)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
