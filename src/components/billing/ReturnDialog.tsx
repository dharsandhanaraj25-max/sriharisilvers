"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";

interface SaleItem {
  id: string;
  itemName: string;
  quantity: number;
  netWeight: number;
  purity: string;
  itemTotal: number;
}

interface ReturnDialogProps {
  saleId: string;
  billNumber: string;
  items: SaleItem[];
  total: number;
  onSuccess: () => void;
  onClose: () => void;
}

const REFUND_MODES = [
  { value: "CASH", label: "Cash" },
  { value: "UPI", label: "UPI / GPay" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "CREDIT", label: "Store Credit" },
];

export function ReturnDialog({ saleId, billNumber, items, total, onSuccess, onClose }: ReturnDialogProps) {
  const [selectedItems, setSelectedItems] = useState<Record<string, { selected: boolean; qty: number; restocked: boolean; faulty: boolean }>>(() =>
    Object.fromEntries(items.map((i) => [i.id, { selected: false, qty: i.quantity, restocked: true, faulty: false }]))
  );
  const [reason, setReason] = useState("");
  const [refundMode, setRefundMode] = useState("CASH");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleItem = (id: string) => {
    setSelectedItems((prev) => ({
      ...prev,
      [id]: { ...prev[id], selected: !prev[id].selected },
    }));
  };

  const updateQty = (id: string, qty: number) => {
    const max = items.find((i) => i.id === id)?.quantity || 1;
    setSelectedItems((prev) => ({
      ...prev,
      [id]: { ...prev[id], qty: Math.min(Math.max(1, qty), max) },
    }));
  };

  const toggleRestock = (id: string) => {
    setSelectedItems((prev) => ({
      ...prev,
      [id]: { ...prev[id], restocked: !prev[id].restocked, faulty: false },
    }));
  };

  const toggleFaulty = (id: string) => {
    setSelectedItems((prev) => ({
      ...prev,
      [id]: { ...prev[id], faulty: !prev[id].faulty },
    }));
  };

  const getRefundForItem = (item: SaleItem, qty: number) => {
    return (item.itemTotal / item.quantity) * qty;
  };

  const selectedList = items.filter((i) => selectedItems[i.id]?.selected);
  const totalRefund = selectedList.reduce((sum, i) => {
    const s = selectedItems[i.id];
    return sum + getRefundForItem(i, s.qty);
  }, 0);

  const handleSubmit = async () => {
    if (!reason.trim()) { setError("Please enter a reason for return."); return; }
    if (selectedList.length === 0) { setError("Please select at least one item to return."); return; }

    setLoading(true);
    setError("");

    try {
      const payload = {
        reason,
        refundMode,
        notes,
        items: selectedList.map((item) => ({
          saleItemId: item.id,
          quantity: selectedItems[item.id].qty,
          refundAmount: getRefundForItem(item, selectedItems[item.id].qty),
          restocked: selectedItems[item.id].restocked,
          faulty: selectedItems[item.id].faulty,
        })),
      };

      const res = await fetch(`/api/sales/${saleId}/return`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Return failed");
      }

      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Return failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Process Return</h2>
            <p className="text-sm text-slate-500">Bill #{billNumber}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {/* Items selection */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Select Items to Return</h3>
            <div className="space-y-2">
              {items.map((item) => {
                const s = selectedItems[item.id];
                return (
                  <div key={item.id} className={`border rounded-xl p-3 transition-colors ${s.selected ? "border-amber-400 bg-amber-50" : "border-slate-200"}`}>
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={s.selected}
                        onChange={() => toggleItem(item.id)}
                        className="mt-1 w-4 h-4 accent-amber-500 cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-slate-800 text-sm truncate">{item.itemName}</p>
                          <span className="text-sm font-semibold text-slate-700 shrink-0">{formatCurrency(item.itemTotal)}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Purity: {item.purity} | Weight: {item.netWeight.toFixed(3)}g | Qty: {item.quantity}
                        </p>

                        {s.selected && (
                          <div className="mt-2 flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <label className="text-xs text-slate-600">Return Qty:</label>
                              <input
                                type="number"
                                min={1}
                                max={item.quantity}
                                value={s.qty}
                                onChange={(e) => updateQty(item.id, parseInt(e.target.value) || 1)}
                                className="w-16 border border-slate-300 rounded-lg px-2 py-1 text-sm text-center"
                              />
                              <span className="text-xs text-slate-500">of {item.quantity}</span>
                            </div>
                            <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={s.restocked}
                                onChange={() => toggleRestock(item.id)}
                                className="accent-green-500"
                              />
                              Restock
                            </label>
                            {s.restocked && (
                              <label className="flex items-center gap-1.5 text-xs text-red-600 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={s.faulty}
                                  onChange={() => toggleFaulty(item.id)}
                                  className="accent-red-500"
                                />
                                Mark as Faulty
                              </label>
                            )}
                            <span className="text-xs font-semibold text-green-700 ml-auto">
                              Refund: {formatCurrency(getRefundForItem(item, s.qty))}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Reason for Return <span className="text-red-500">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="">Select reason...</option>
              <option value="Defective product">Defective product</option>
              <option value="Wrong item delivered">Wrong item delivered</option>
              <option value="Customer changed mind">Customer changed mind</option>
              <option value="Size/fit issue">Size / Fit issue</option>
              <option value="Quality not satisfactory">Quality not satisfactory</option>
              <option value="Goodwill return">Goodwill return</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Refund mode */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Refund Payment Mode</label>
            <div className="grid grid-cols-2 gap-2">
              {REFUND_MODES.map((mode) => (
                <button
                  key={mode.value}
                  type="button"
                  onClick={() => setRefundMode(mode.value)}
                  className={`py-2 px-3 rounded-xl border text-sm font-medium transition-colors ${
                    refundMode === mode.value
                      ? "border-amber-500 bg-amber-50 text-amber-700"
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Additional Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Any remarks..."
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{error}</div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl flex items-center justify-between gap-4">
          <div>
            {selectedList.length > 0 && (
              <p className="text-sm text-slate-600">
                Refunding{" "}
                <span className="font-bold text-green-700">{formatCurrency(totalRefund)}</span>
                {" "}via {REFUND_MODES.find((m) => m.value === refundMode)?.label}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || selectedList.length === 0}
              className="px-5 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading && (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              Process Return & Refund
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
