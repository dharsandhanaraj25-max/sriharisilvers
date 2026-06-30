"use client";

import { useState, useEffect } from "react";
import { BarcodeDisplay } from "@/components/ui/BarcodeDisplay";
import { BarcodeLabelPrint } from "@/components/ui/BarcodeLabelPrint";

interface Category { id: string; name: string; }
interface Product {
  id: string;
  name: string;
  purity: string;
  grossWeight: number;
  netWeight: number;
  makingChargeType: string;
  makingChargeValue: number;
  wastagePercent: number;
  currentStock: number;
  minStock: number;
  barcode: string | null;
  category: { name: string };
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [catFilter, setCatFilter] = useState("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({
    categoryId: "", name: "", purity: "999", grossWeight: "", netWeight: "", stoneWeight: "",
    makingChargeType: "PER_GRAM", makingChargeValue: "", wastagePercent: "",
    barcode: "", currentStock: "", minStock: "1", description: "",
  });
  const [saving, setSaving] = useState(false);
  const [labelProduct, setLabelProduct] = useState<Product | null>(null);
  const [showBarcodes, setShowBarcodes] = useState(false);

  async function fetchData() {
    setLoading(true);
    const [pr, cr] = await Promise.all([
      fetch(`/api/products?search=${search}${catFilter ? `&categoryId=${catFilter}` : ""}`),
      fetch("/api/categories"),
    ]);
    setProducts(await pr.json());
    setCategories(await cr.json());
    setLoading(false);
  }

  useEffect(() => { fetchData(); }, [search, catFilter]);

  function openEdit(p: Product) {
    setEditProduct(p);
    setForm({
      categoryId: (p as unknown as { categoryId: string }).categoryId || "",
      name: p.name, purity: p.purity,
      grossWeight: String(p.grossWeight), netWeight: String(p.netWeight), stoneWeight: "0",
      makingChargeType: p.makingChargeType, makingChargeValue: String(p.makingChargeValue),
      wastagePercent: String(p.wastagePercent), barcode: p.barcode || "",
      currentStock: String(p.currentStock), minStock: String(p.minStock), description: "",
    });
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const url = editProduct ? `/api/products/${editProduct.id}` : "/api/products";
    const method = editProduct ? "PUT" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false);
    setShowForm(false);
    setEditProduct(null);
    fetchData();
  }

  const lowStockCount = products.filter(p => p.currentStock <= p.minStock).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Inventory</h1>
          <p className="text-slate-500 text-sm mt-1">{products.length} products {lowStockCount > 0 && <span className="text-red-500 font-medium">· {lowStockCount} low stock</span>}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowBarcodes(!showBarcodes)}
            className={`px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 border transition-colors ${showBarcodes ? "bg-slate-800 text-white border-slate-800" : "border-slate-300 text-slate-600 hover:bg-slate-50"}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            {showBarcodes ? "Hide Barcodes" : "Show Barcodes"}
          </button>
          <button onClick={() => { setEditProduct(null); setForm({ categoryId:"", name:"", purity:"999", grossWeight:"", netWeight:"", stoneWeight:"", makingChargeType:"PER_GRAM", makingChargeValue:"", wastagePercent:"", barcode:"", currentStock:"", minStock:"1", description:"" }); setShowForm(true); }}
            className="text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2" style={{ backgroundColor: "#800020" }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Product
          </button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h2 className="font-semibold text-slate-800 mb-5">{editProduct ? "Edit Product" : "Add New Product"}</h2>
          <form onSubmit={handleSave}>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-1">
                <label className="block text-xs text-slate-600 mb-1">Category *</label>
                <select value={form.categoryId} onChange={(e) => setForm({...form, categoryId: e.target.value})} required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="lg:col-span-2">
                <label className="block text-xs text-slate-600 mb-1">Product Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Purity</label>
                <select value={form.purity} onChange={(e) => setForm({...form, purity: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                  <option value="999">999 (Pure)</option>
                  <option value="925">925 (Sterling)</option>
                  <option value="916">916</option>
                  <option value="875">875</option>
                  <option value="800">800</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Gross Weight (g)</label>
                <input type="number" step="0.001" value={form.grossWeight} onChange={(e) => setForm({...form, grossWeight: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Net Weight (g)</label>
                <input type="number" step="0.001" value={form.netWeight} onChange={(e) => setForm({...form, netWeight: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Making Charge Type</label>
                <select value={form.makingChargeType} onChange={(e) => setForm({...form, makingChargeType: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                  <option value="PER_GRAM">Per Gram (₹/g)</option>
                  <option value="PERCENT">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Making Charge Value</label>
                <input type="number" step="0.01" value={form.makingChargeValue} onChange={(e) => setForm({...form, makingChargeValue: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Wastage %</label>
                <input type="number" step="0.1" value={form.wastagePercent} onChange={(e) => setForm({...form, wastagePercent: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Current Stock (pcs)</label>
                <input type="number" step="1" value={form.currentStock} onChange={(e) => setForm({...form, currentStock: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Min Stock Alert</label>
                <input type="number" step="1" value={form.minStock} onChange={(e) => setForm({...form, minStock: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Barcode</label>
                <input type="text" value={form.barcode} onChange={(e) => setForm({...form, barcode: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button type="submit" disabled={saving}
                className="bg-amber-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-amber-600 disabled:opacity-70">
                {saving ? "Saving..." : editProduct ? "Update Product" : "Add Product"}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="border border-slate-300 text-slate-600 px-4 py-2.5 rounded-lg text-sm hover:bg-slate-50">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex gap-3">
        <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Product</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Category</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500">Purity</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500">Net Wt</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Making</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500">Wastage</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500">Stock</th>
                {showBarcodes && <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500">Barcode</th>}
              <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={showBarcodes ? 9 : 8} className="text-center py-12 text-slate-400">Loading...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={showBarcodes ? 9 : 8} className="text-center py-12 text-slate-400">No products found</td></tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-semibold text-slate-800">{p.name}</p>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{p.barcode || "—"}</p>
                    </td>
                    <td className="px-5 py-3 text-slate-500">{p.category.name}</td>
                    <td className="px-5 py-3 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">{p.purity}</span>
                    </td>
                    <td className="px-5 py-3 text-right text-slate-700 font-medium">{p.netWeight.toFixed(3)}g</td>
                    <td className="px-5 py-3 text-slate-600 text-xs">
                      {p.makingChargeValue} {p.makingChargeType === "PER_GRAM" ? "₹/g" : p.makingChargeType === "PERCENT" ? "%" : "₹"}
                    </td>
                    <td className="px-5 py-3 text-right text-slate-500">{p.wastagePercent}%</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        p.currentStock <= 0 ? "bg-red-100 text-red-700" :
                        p.currentStock <= p.minStock ? "bg-orange-100 text-orange-700" :
                        "bg-emerald-100 text-emerald-700"
                      }`}>
                        {p.currentStock} pcs
                      </span>
                    </td>
                    {showBarcodes && (
                      <td className="px-5 py-3 text-center">
                        {p.barcode ? (
                          <div className="flex flex-col items-center gap-1">
                            <BarcodeDisplay value={p.barcode} height={32} fontSize={8} />
                            <button
                              onClick={() => setLabelProduct(p)}
                              className="text-xs font-medium px-2 py-0.5 rounded border border-slate-300 text-slate-600 hover:bg-slate-100"
                            >
                              Print Label
                            </button>
                          </div>
                        ) : <span className="text-slate-300 text-xs">—</span>}
                      </td>
                    )}
                    <td className="px-5 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEdit(p)} className="text-xs font-medium text-slate-600 hover:text-slate-800 px-2 py-1 rounded border border-slate-200 hover:bg-slate-50">Edit</button>
                        {!showBarcodes && p.barcode && (
                          <button onClick={() => setLabelProduct(p)} className="text-xs font-medium text-slate-600 hover:text-slate-800 px-2 py-1 rounded border border-slate-200 hover:bg-slate-50">Label</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {labelProduct && labelProduct.barcode && (
        <BarcodeLabelPrint
          product={{ ...labelProduct, barcode: labelProduct.barcode }}
          onClose={() => setLabelProduct(null)}
        />
      )}
    </div>
  );
}
