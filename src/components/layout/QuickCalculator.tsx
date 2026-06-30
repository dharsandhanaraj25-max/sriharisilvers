"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";

interface QuickCalculatorProps {
  rates: {
    rate999: number;
    rate925: number;
    rate916: number;
    rate875: number;
    rate800: number;
  } | null;
}

const PURITIES = [
  { key: "999", label: "999 — Fine Silver", rateKey: "rate999" as const },
  { key: "925", label: "925 — Sterling", rateKey: "rate925" as const },
  { key: "916", label: "916", rateKey: "rate916" as const },
  { key: "875", label: "875", rateKey: "rate875" as const },
  { key: "800", label: "800", rateKey: "rate800" as const },
];

export function QuickCalculator({ rates }: QuickCalculatorProps) {
  const [open, setOpen] = useState(false);
  const [weight, setWeight] = useState<number | "">("");
  const [purity, setPurity] = useState("999");
  const [makingPer, setMakingPer] = useState<number | "">("");
  const [qty, setQty] = useState(1);

  const selectedPurity = PURITIES.find((p) => p.key === purity)!;
  const ratePerGram = rates ? rates[selectedPurity.rateKey] : 0;
  const netWeight = (weight || 0) * qty;
  const silverValue = netWeight * ratePerGram;
  const makingValue = (makingPer || 0) * netWeight;
  const gst = (silverValue + makingValue) * 0.03;
  const total = silverValue + makingValue + gst;

  const reset = () => { setWeight(""); setPurity("999"); setMakingPer(""); setQty(1); };

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        title="Quick Rate Calculator"
        className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <span className="hidden sm:inline">Calc</span>
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
            {/* Header */}
            <div className="bg-slate-800 text-white px-5 py-4 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-base">Quick Rate Calculator</h2>
                <p className="text-slate-400 text-xs mt-0.5">Instant silver value — no bill needed</p>
              </div>
              <button onClick={() => { setOpen(false); reset(); }} className="text-slate-400 hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Rate display */}
              {rates && (
                <div className="grid grid-cols-3 gap-2 bg-burgundy-50 rounded-xl p-3">
                  {PURITIES.slice(0, 3).map((p) => (
                    <button key={p.key} onClick={() => setPurity(p.key)}
                      className={`text-center p-1.5 rounded-lg transition-colors ${purity === p.key ? "bg-burgundy-500 text-white" : "hover:bg-burgundy-100"}`}>
                      <div className={`text-xs font-bold ${purity === p.key ? "text-white" : "text-burgundy-700"}`}>{p.key}</div>
                      <div className={`text-xs ${purity === p.key ? "text-burgundy-100" : "text-slate-500"}`}>₹{rates[p.rateKey]}</div>
                    </button>
                  ))}
                </div>
              )}

              {/* Purity full select */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Purity</label>
                <select value={purity} onChange={(e) => setPurity(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-burgundy-400">
                  {PURITIES.map((p) => (
                    <option key={p.key} value={p.key}>{p.label} — ₹{rates ? rates[p.rateKey] : 0}/g</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Weight (grams)</label>
                  <input type="number" value={weight} onChange={(e) => setWeight(e.target.value === "" ? "" : parseFloat(e.target.value) || 0)}
                    step="0.001" min="0" placeholder="0.000"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-burgundy-400 text-right font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Quantity</label>
                  <input type="number" value={qty} onChange={(e) => setQty(parseInt(e.target.value) || 1)}
                    min="1" step="1"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-burgundy-400 text-right" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Making Charge (₹/g) — optional</label>
                <input type="number" value={makingPer} onChange={(e) => setMakingPer(e.target.value === "" ? "" : parseFloat(e.target.value) || 0)}
                  step="0.5" min="0" placeholder="0"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-burgundy-400 text-right" />
              </div>

              {/* Result */}
              <div className="bg-slate-800 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between text-slate-300">
                  <span>Silver Value <span className="text-slate-500 text-xs">({netWeight.toFixed(3)}g × ₹{ratePerGram})</span></span>
                  <span className="font-mono">{formatCurrency(silverValue)}</span>
                </div>
                {(makingPer || 0) > 0 && (
                  <div className="flex justify-between text-slate-300">
                    <span>Making</span>
                    <span className="font-mono">{formatCurrency(makingValue)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-300">
                  <span>GST (3%)</span>
                  <span className="font-mono">{formatCurrency(gst)}</span>
                </div>
                <div className="flex justify-between text-white font-bold text-lg border-t border-slate-600 pt-2">
                  <span>Total</span>
                  <span className="text-burgundy-300 font-mono">{formatCurrency(total)}</span>
                </div>
                {qty > 1 && (
                  <div className="flex justify-between text-slate-400 text-xs">
                    <span>Per piece</span>
                    <span className="font-mono">{formatCurrency(total / qty)}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button onClick={reset}
                  className="flex-1 border border-slate-200 text-slate-600 py-2 rounded-xl text-sm font-medium hover:bg-slate-50">
                  Clear
                </button>
                <a href="/billing/new"
                  className="flex-1 bg-burgundy-500 hover:bg-burgundy-600 text-white py-2 rounded-xl text-sm font-medium text-center">
                  Start Bill
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
