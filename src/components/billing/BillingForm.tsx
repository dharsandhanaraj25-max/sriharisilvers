"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  calculateSilverItem,
  formatCurrency,
  PURITY_LABELS,
  PAYMENT_MODES,
  type SilverCalculation,
} from "@/lib/utils";
import { BillPrintView } from "./BillPrintView";
import { EstimateSlipView } from "./EstimateSlipView";

interface Category {
  id: string;
  name: string;
  products: Product[];
}

interface Product {
  id: string;
  name: string;
  purity: string;
  grossWeight: number;
  netWeight: number;
  stoneWeight: number;
  makingChargeType: string;
  makingChargeValue: number;
  wastagePercent: number;
}

interface SilverRate {
  rate999: number;
  rate925: number;
  rate916: number;
  rate875: number;
  rate800: number;
}

interface BillingItem {
  id: string;
  productId?: string;
  itemName: string;
  hsnCode: string;
  grossWeight: number;
  stoneWeight: number;
  netWeight: number;
  purity: string;
  quantity: number;
  silverRate: number;
  makingChargeType: string;
  makingChargeValue: number;
  wastagePercent: number;
  wastageWeight: number;
  silverValue: number;
  makingAmount: number;
  gstAmount: number;
  itemTotal: number;
  isFixedPrice: boolean;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
}

const PURITY_RATE_MAP: Record<string, keyof SilverRate> = {
  "999": "rate999",
  "925": "rate925",
  "916": "rate916",
  "875": "rate875",
  "800": "rate800",
};

function getRate(silverRate: SilverRate | null, purity: string): number {
  if (!silverRate) return 0;
  const key = PURITY_RATE_MAP[purity] || "rate999";
  return silverRate[key];
}

function newItem(silverRate: SilverRate | null): BillingItem {
  return {
    id: Math.random().toString(36).slice(2),
    itemName: "",
    hsnCode: "71131100",
    grossWeight: 0,
    stoneWeight: 0,
    netWeight: 0,
    purity: "999",
    quantity: 1,
    silverRate: silverRate?.rate999 || 0,
    makingChargeType: "PER_GRAM",
    makingChargeValue: 0,
    wastagePercent: 0,
    wastageWeight: 0,
    silverValue: 0,
    makingAmount: 0,
    gstAmount: 0,
    itemTotal: 0,
    isFixedPrice: false,
  };
}

function recalcItem(item: BillingItem, gstPercent: number): BillingItem {
  const calc: SilverCalculation = {
    grossWeight: item.grossWeight,
    stoneWeight: item.stoneWeight,
    wastagePercent: item.wastagePercent,
    purity: item.purity,
    silverRate: item.silverRate,
    makingChargeType: item.makingChargeType as "PER_GRAM" | "PERCENT" | "FIXED",
    makingChargeValue: item.makingChargeValue,
    quantity: item.quantity,
    gstPercent,
  };
  const r = calculateSilverItem(calc);
  return {
    ...item,
    netWeight: r.netWeight,
    wastageWeight: r.wastageWeight,
    silverValue: r.silverValue,
    makingAmount: r.makingAmount,
    gstAmount: r.gstAmount,
    itemTotal: r.itemTotal,
  };
}

export function BillingForm({
  latestRate,
  categories,
}: {
  latestRate: SilverRate | null;
  categories: Category[];
  createdById: string;
}) {
  const router = useRouter();
  const printRef = useRef<HTMLDivElement>(null);
  const [loading, setSaving] = useState(false);
  const [saved, setSaved] = useState<{ id: string; billNumber: string } | null>(null);
  const [formDirty, setFormDirty] = useState(false);
  const [error, setError] = useState("");
  const [showEstimate, setShowEstimate] = useState(false);
  const [quoteRef] = useState(() => `EST-${Date.now().toString(36).toUpperCase()}`);

  // GST — editable CGST and SGST, defaulting to 1.5% each
  const [cgstPercent, setCgstPercent] = useState<number | "">(1.5);
  const [sgstPercent, setSgstPercent] = useState<number | "">(1.5);
  const gstPercent = (cgstPercent || 0) + (sgstPercent || 0);

  const [items, setItems] = useState<BillingItem[]>([newItem(latestRate)]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerResults, setCustomerResults] = useState<Customer[]>([]);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [duplicateWarning, setDuplicateWarning] = useState("");

  // Payment
  const [paymentMode, setPaymentMode] = useState("CASH");
  const [cashAmount, setCashAmount] = useState(0);
  const [cardAmount, setCardAmount] = useState(0);
  const [upiAmount, setUpiAmount] = useState(0);
  const [chequeAmount, setChequeAmount] = useState(0);

  // Discount
  const [discountType, setDiscountType] = useState<"FLAT" | "PERCENT">("FLAT");
  const [discountValue, setDiscountValue] = useState<number | "">("");

  const [notes, setNotes] = useState("");

  // Old silver exchange
  const [hasOldSilver, setHasOldSilver] = useState(false);
  const [oldSilverWeight, setOldSilverWeight] = useState(0);
  const [oldSilverPurity, setOldSilverPurity] = useState("925");
  const [oldSilverRate, setOldSilverRate] = useState(latestRate?.rate925 || 0);

  // Track form dirty state for unsaved-changes warning
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (formDirty && !saved) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [formDirty, saved]);

  const markDirty = () => setFormDirty(true);

  // Totals
  const subtotal = items.reduce((s, i) => s + i.silverValue + i.makingAmount, 0);
  const totalGST = items.reduce((s, i) => s + i.gstAmount, 0);
  const totalMaking = items.reduce((s, i) => s + i.makingAmount, 0);
  const totalWastage = items.reduce((s, i) => s + i.wastageWeight * i.silverRate, 0);
  const oldSilverDeduction = hasOldSilver
    ? oldSilverWeight * oldSilverRate * (parseFloat(oldSilverPurity) / 999)
    : 0;

  const discountNum = discountValue === "" ? 0 : discountValue;
  const discount = discountType === "PERCENT"
    ? (subtotal + totalGST) * discountNum / 100
    : discountNum;

  const grossTotal = subtotal + totalGST - discount - oldSilverDeduction;
  const roundOff = Math.round(grossTotal) - grossTotal;
  const total = Math.round(grossTotal);
  const amountPaid = paymentMode === "MULTIPLE"
    ? cashAmount + cardAmount + upiAmount + chequeAmount
    : paymentMode === "CREDIT" ? 0 : total;
  const change = Math.max(0, amountPaid - total);

  const updateItem = useCallback((id: string, updates: Partial<BillingItem>) => {
    markDirty();
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        let updated = { ...item, ...updates };
        if (updates.purity) {
          updated.silverRate = getRate(latestRate, updates.purity);
        }
        if (updates.isFixedPrice === true) {
          updated = {
            ...updated,
            grossWeight: 0,
            stoneWeight: 0,
            wastagePercent: 0,
            silverRate: 0,
            makingChargeType: "FIXED",
            makingChargeValue: item.makingChargeType === "FIXED" ? item.makingChargeValue : 0,
          };
        } else if (updates.isFixedPrice === false) {
          updated = {
            ...updated,
            makingChargeType: "PER_GRAM",
            makingChargeValue: 0,
            silverRate: getRate(latestRate, updated.purity),
          };
        }
        return recalcItem(updated, gstPercent);
      })
    );
  }, [latestRate, gstPercent]);

  // Recalc all items when GST changes
  useEffect(() => {
    setItems((prev) => prev.map((item) => recalcItem(item, gstPercent)));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gstPercent]);

  const addItem = () => { markDirty(); setItems((prev) => [...prev, newItem(latestRate)]); };
  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

  // Barcode scanner
  const [barcodeInput, setBarcodeInput] = useState("");
  const [barcodeStatus, setBarcodeStatus] = useState<"idle" | "scanning" | "found" | "notfound">("idle");

  async function handleBarcodeScan(code: string) {
    if (!code.trim()) return;
    setBarcodeStatus("scanning");
    try {
      const res = await fetch(`/api/products/lookup?barcode=${encodeURIComponent(code.trim())}`);
      if (!res.ok) { setBarcodeStatus("notfound"); setTimeout(() => setBarcodeStatus("idle"), 2000); return; }
      const product: Product = await res.json();
      // Add as new item with product data pre-filled
      markDirty();
      setItems((prev) => {
        const last = prev[prev.length - 1];
        const isBlank = !last.itemName && !last.productId;
        const rateMap: Record<string, number> = latestRate ? {
          "999": latestRate.rate999, "925": latestRate.rate925,
          "916": latestRate.rate916, "875": latestRate.rate875, "800": latestRate.rate800,
        } : {};
        const base: BillingItem = {
          id: Math.random().toString(36).slice(2),
          productId: product.id,
          itemName: product.name,
          hsnCode: "71131100",
          purity: product.purity,
          grossWeight: product.grossWeight,
          stoneWeight: product.stoneWeight,
          netWeight: product.netWeight,
          wastagePercent: product.wastagePercent,
          wastageWeight: 0,
          silverRate: rateMap[product.purity] || latestRate?.rate999 || 0,
          makingChargeType: product.makingChargeType,
          makingChargeValue: product.makingChargeValue,
          quantity: 1,
          silverValue: 0,
          makingAmount: 0,
          gstAmount: 0,
          itemTotal: 0,
          isFixedPrice: false,
        };
        const filled = recalcItem(base, gstPercent);
        return isBlank ? [...prev.slice(0, -1), filled] : [...prev, filled];
      });
      setBarcodeStatus("found");
      setBarcodeInput("");
      setTimeout(() => setBarcodeStatus("idle"), 1500);
    } catch {
      setBarcodeStatus("notfound");
      setTimeout(() => setBarcodeStatus("idle"), 2000);
    }
  }

  const loadFromProduct = (itemId: string, product: Product) => {
    markDirty();
    updateItem(itemId, {
      productId: product.id,
      itemName: product.name,
      purity: product.purity,
      grossWeight: product.grossWeight,
      stoneWeight: product.stoneWeight,
      netWeight: product.netWeight,
      makingChargeType: product.makingChargeType,
      makingChargeValue: product.makingChargeValue,
      wastagePercent: product.wastagePercent,
      silverRate: getRate(latestRate, product.purity),
    });
  };

  async function searchCustomers(q: string) {
    if (q.length < 2) { setCustomerResults([]); return; }
    const res = await fetch(`/api/customers?search=${encodeURIComponent(q)}&limit=5`);
    const data = await res.json();
    setCustomerResults(data.customers || []);
  }

  async function checkDuplicate(name: string, phone: string) {
    if (phone.length >= 10) {
      const res = await fetch(`/api/customers?search=${encodeURIComponent(phone)}&limit=1`);
      const data = await res.json();
      if (data.customers?.length > 0) {
        setDuplicateWarning(`Phone ${phone} already registered as "${data.customers[0].name}". Use search to select them.`);
        return;
      }
    }
    if (name.length >= 3) {
      const res = await fetch(`/api/customers?search=${encodeURIComponent(name)}&limit=3`);
      const data = await res.json();
      if (data.customers?.length > 0) {
        setDuplicateWarning(`Similar name found: "${data.customers[0].name}" (${data.customers[0].phone}). Confirm if new customer.`);
        return;
      }
    }
    setDuplicateWarning("");
  }

  async function addNewCustomer() {
    if (!newCustomerName.trim() || !newCustomerPhone.trim()) return;
    const res = await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCustomerName.trim(), phone: newCustomerPhone.trim() }),
    });
    const data = await res.json();
    if (res.ok) {
      setCustomer({ id: data.id, name: data.name, phone: data.phone });
      setShowAddCustomer(false);
      setNewCustomerName("");
      setNewCustomerPhone("");
      setDuplicateWarning("");
    } else {
      alert(data.error || "Failed to add customer");
    }
  }

  async function handleSave() {
    setError("");
    if (!customer) {
      setError("Customer name and phone number are required before saving a bill.");
      return;
    }
    if (items.some((i) => !i.itemName.trim())) {
      setError("Please fill item names for all rows.");
      return;
    }

    setSaving(true);
    try {
      const body = {
        customerId: customer.id,
        silverRate: latestRate?.rate999 || 0,
        silverPurity: "999",
        subtotal,
        makingCharges: totalMaking,
        wastageAmount: totalWastage,
        gstPercent,
        gstAmount: totalGST,
        discount,
        oldSilverDeduction,
        oldSilverWeight: hasOldSilver ? oldSilverWeight : 0,
        oldSilverRate: hasOldSilver ? oldSilverRate : 0,
        oldSilverPurity: hasOldSilver ? oldSilverPurity : "999",
        roundOff,
        total,
        paymentMode,
        cashAmount: paymentMode === "CASH" ? total : cashAmount,
        cardAmount: paymentMode === "CARD" ? total : cardAmount,
        upiAmount: paymentMode === "UPI" ? total : upiAmount,
        chequeAmount: paymentMode === "CHEQUE" ? total : chequeAmount,
        amountPaid,
        change,
        notes,
        items: items.map((i) => ({
          productId: i.productId || null,
          itemName: i.itemName,
          hsnCode: i.hsnCode,
          grossWeight: i.grossWeight,
          stoneWeight: i.stoneWeight,
          netWeight: i.netWeight,
          purity: i.purity,
          quantity: i.quantity,
          silverRate: i.silverRate,
          makingChargeType: i.makingChargeType,
          makingChargeValue: i.makingChargeValue,
          wastagePercent: i.wastagePercent,
          wastageWeight: i.wastageWeight,
          silverValue: i.silverValue,
          makingAmount: i.makingAmount,
          gstAmount: i.gstAmount,
          itemTotal: i.itemTotal,
        })),
      };

      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        setFormDirty(false);
        setSaved({ id: data.id, billNumber: data.billNumber });
      } else {
        setError(data.error || "Failed to save bill");
      }
    } finally {
      setSaving(false);
    }
  }

  if (saved) {
    return (
      <div>
        <div className="print:hidden">
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-green-800">Bill saved successfully!</p>
                <p className="text-sm text-green-600">Bill No: <strong>{saved.billNumber}</strong> | Total: <strong>{formatCurrency(total)}</strong></p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => window.print()} className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print Bill
              </button>
              <button
                onClick={() => router.push("/billing/new")}
                className="bg-burgundy-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-burgundy-600"
              >
                New Bill
              </button>
              <button onClick={() => router.push("/billing")} className="border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50">
                View Sales
              </button>
            </div>
          </div>
        </div>
        <div ref={printRef}>
          <BillPrintView
            billNumber={saved.billNumber}
            customer={customer}
            items={items}
            subtotal={subtotal}
            totalMaking={totalMaking}
            totalWastage={totalWastage}
            totalGST={totalGST}
            cgstPercent={cgstPercent === "" ? 0 : cgstPercent}
            sgstPercent={sgstPercent === "" ? 0 : sgstPercent}
            discount={discount}
            oldSilverDeduction={oldSilverDeduction}
            oldSilverWeight={oldSilverWeight}
            oldSilverRate={oldSilverRate}
            roundOff={roundOff}
            total={total}
            paymentMode={paymentMode}
            amountPaid={amountPaid}
            change={change}
            notes={notes}
            silverRate999={latestRate?.rate999 || 0}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Silver Rate Banner */}
      {latestRate && (
        <div className="bg-burgundy-50 border border-burgundy-200 rounded-xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm">
            <span className="font-semibold text-burgundy-800">Today&apos;s Rates (per gram):</span>
            <span className="text-burgundy-700">999: ₹{latestRate.rate999}</span>
            <span className="text-burgundy-700">925: ₹{latestRate.rate925}</span>
            <span className="text-burgundy-700">916: ₹{latestRate.rate916}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-600">
            <span className="font-medium">CGST:</span>
            <input
              type="number"
              value={cgstPercent}
              onChange={(e) => { setCgstPercent(e.target.value === "" ? "" : parseFloat(e.target.value) || 0); markDirty(); }}
              step="0.5"
              min="0"
              max="14"
              className="w-16 px-2 py-1 border border-slate-300 rounded text-center focus:outline-none focus:ring-1 focus:ring-burgundy-500"
              placeholder="1.5"
            />
            <span>%</span>
            <span className="font-medium ml-2">SGST:</span>
            <input
              type="number"
              value={sgstPercent}
              onChange={(e) => { setSgstPercent(e.target.value === "" ? "" : parseFloat(e.target.value) || 0); markDirty(); }}
              step="0.5"
              min="0"
              max="14"
              className="w-16 px-2 py-1 border border-slate-300 rounded text-center focus:outline-none focus:ring-1 focus:ring-burgundy-500"
              placeholder="1.5"
            />
            <span>%</span>
            <span className="ml-2 text-slate-500">Total GST: {gstPercent}%</span>
          </div>
        </div>
      )}

      {/* Customer Section — MANDATORY */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-800">
            Customer Details <span className="text-red-500 text-sm">*</span>
          </h2>
          <span className="text-xs text-slate-400">Required for billing</span>
        </div>
        {customer ? (
          <div className="flex items-center justify-between bg-burgundy-50 border border-burgundy-200 rounded-lg px-4 py-3">
            <div>
              <p className="font-semibold text-slate-800">{customer.name}</p>
              <p className="text-sm text-slate-500">{customer.phone}</p>
            </div>
            <button onClick={() => setCustomer(null)} className="text-red-500 hover:text-red-700 text-sm font-medium">
              Change
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by name or mobile number..."
                  value={customerSearch}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value);
                    searchCustomers(e.target.value);
                  }}
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-burgundy-400"
                />
                {customerResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-10 overflow-hidden">
                    {customerResults.map((c) => (
                      <button
                        key={c.id}
                        className="w-full text-left px-4 py-2.5 hover:bg-burgundy-50 flex items-center justify-between border-b border-slate-50 last:border-0"
                        onClick={() => {
                          setCustomer(c);
                          setCustomerSearch("");
                          setCustomerResults([]);
                          markDirty();
                        }}
                      >
                        <span className="font-medium text-slate-800">{c.name}</span>
                        <span className="text-sm text-slate-500">{c.phone}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => { setShowAddCustomer(true); setDuplicateWarning(""); }}
                className="px-4 py-2.5 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700"
              >
                + New
              </button>
            </div>
            <p className="text-xs text-red-500 font-medium">Customer is required — search or add a new one</p>

            {showAddCustomer && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
                <h3 className="text-sm font-semibold text-slate-700">Add New Customer</h3>
                {duplicateWarning && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-xs text-yellow-800">
                    {duplicateWarning}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Customer Name *"
                    value={newCustomerName}
                    onChange={(e) => {
                      setNewCustomerName(e.target.value);
                      if (e.target.value.length >= 3) checkDuplicate(e.target.value, newCustomerPhone);
                    }}
                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-burgundy-400"
                  />
                  <input
                    type="tel"
                    placeholder="Mobile Number * (10 digits)"
                    value={newCustomerPhone}
                    maxLength={10}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                      setNewCustomerPhone(val);
                      if (val.length === 10) checkDuplicate(newCustomerName, val);
                    }}
                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-burgundy-400"
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={addNewCustomer} className="bg-burgundy-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-burgundy-600">Save Customer</button>
                  <button onClick={() => { setShowAddCustomer(false); setDuplicateWarning(""); }} className="border border-slate-300 text-slate-600 px-4 py-2 rounded-lg text-sm hover:bg-slate-50">Cancel</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Barcode Scanner */}
      <div className={`rounded-xl border px-4 py-3 flex items-center gap-3 transition-colors ${
        barcodeStatus === "found" ? "bg-green-50 border-green-300" :
        barcodeStatus === "notfound" ? "bg-red-50 border-red-300" :
        barcodeStatus === "scanning" ? "bg-blue-50 border-blue-300" :
        "bg-white border-slate-200 shadow-sm"
      }`}>
        <div className="flex items-center gap-2 text-slate-500 flex-shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
          <span className="text-sm font-medium text-slate-600 whitespace-nowrap">Scan Barcode</span>
        </div>
        <input
          type="text"
          value={barcodeInput}
          onChange={(e) => setBarcodeInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleBarcodeScan(barcodeInput); } }}
          placeholder="Scan or type barcode, then press Enter..."
          className="flex-1 text-sm bg-transparent outline-none placeholder-slate-400 text-slate-800"
        />
        {barcodeStatus === "scanning" && <span className="text-xs text-blue-600 font-medium">Searching...</span>}
        {barcodeStatus === "found" && <span className="text-xs text-green-600 font-semibold">Added to bill</span>}
        {barcodeStatus === "notfound" && <span className="text-xs text-red-600 font-semibold">Barcode not found</span>}
        {barcodeInput && barcodeStatus === "idle" && (
          <button onClick={() => handleBarcodeScan(barcodeInput)} className="text-xs font-medium px-3 py-1 rounded-lg text-white" style={{ backgroundColor: "#800020" }}>
            Add
          </button>
        )}
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">Bill Items</h2>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>HSN: 71131100</span>
            <span>|</span>
            <span>GST: {gstPercent}%</span>
          </div>
        </div>

        {/* Mobile hint */}
        <p className="sm:hidden px-4 pt-3 text-xs text-slate-400">Scroll sideways to see all columns →</p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-3 py-3 text-xs font-semibold text-slate-500 w-8">#</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-slate-500 min-w-56">Item / Product</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-slate-500 w-32">Purity</th>
                <th className="text-right px-3 py-3 text-xs font-semibold text-slate-500 w-28">Gross Weight (g)</th>
                <th className="text-right px-3 py-3 text-xs font-semibold text-slate-500 w-28">Stone Weight (g)</th>
                <th className="text-right px-3 py-3 text-xs font-semibold text-slate-500 w-24">Wastage %</th>
                <th className="text-right px-3 py-3 text-xs font-semibold text-slate-500 w-28">Net Weight (g)</th>
                <th className="text-right px-3 py-3 text-xs font-semibold text-slate-500 w-24">Rate (₹/g)</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-slate-500 w-32">Making Charge</th>
                <th className="text-right px-3 py-3 text-xs font-semibold text-slate-500 w-28">Silver Value</th>
                <th className="text-right px-3 py-3 text-xs font-semibold text-slate-500 w-24">Making Amt</th>
                <th className="text-right px-3 py-3 text-xs font-semibold text-slate-500 w-20">GST</th>
                <th className="text-right px-3 py-3 text-xs font-semibold text-slate-500 w-28">Total</th>
                <th className="w-8 px-3" />
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={item.id} className="border-b border-slate-100 align-top hover:bg-slate-50/50">
                  <td className="px-3 py-3 text-slate-500 text-xs">{idx + 1}</td>
                  <td className="px-3 py-3">
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        value={item.itemName}
                        onChange={(e) => updateItem(item.id, { itemName: e.target.value })}
                        placeholder="Item name *"
                        className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-burgundy-400"
                      />
                      <select
                        onChange={(e) => {
                          const val = e.target.value;
                          if (!val) return;
                          const [catIdx, prodIdx] = val.split("-").map(Number);
                          loadFromProduct(item.id, categories[catIdx].products[prodIdx]);
                        }}
                        className="w-full px-2 py-1 border border-slate-100 rounded text-xs text-slate-500 focus:outline-none"
                        defaultValue=""
                      >
                        <option value="">Quick select product...</option>
                        {categories.map((cat, ci) =>
                          cat.products.length > 0 ? (
                            <optgroup key={cat.id} label={cat.name}>
                              {cat.products.map((p, pi) => (
                                <option key={p.id} value={`${ci}-${pi}`}>{p.name}</option>
                              ))}
                            </optgroup>
                          ) : null
                        )}
                      </select>
                      <label className="flex items-center gap-1.5 pt-0.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={item.isFixedPrice}
                          onChange={(e) => updateItem(item.id, { isFixedPrice: e.target.checked })}
                          className="w-3.5 h-3.5 accent-burgundy-500"
                        />
                        <span className="text-xs text-slate-500">Fixed price item (no weight)</span>
                      </label>
                    </div>
                  </td>
                  {item.isFixedPrice ? (
                    <>
                      <td colSpan={6} className="px-3 py-3 text-center text-xs text-slate-400 italic">
                        Flat-priced item — weight, purity and rate not applicable
                      </td>
                      <td className="px-3 py-3">
                        <label className="block text-[11px] text-slate-400 mb-1">Item Price (₹)</label>
                        <input type="number" value={item.makingChargeValue || ""} onChange={(e) => updateItem(item.id, { makingChargeValue: parseFloat(e.target.value) || 0 })}
                          step="1" min="0" placeholder="20000"
                          className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-sm text-right font-medium focus:outline-none focus:ring-1 focus:ring-burgundy-400" />
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-3 py-3">
                        <select
                          value={item.purity}
                          onChange={(e) => updateItem(item.id, { purity: e.target.value })}
                          className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-burgundy-400"
                        >
                          {Object.entries(PURITY_LABELS).map(([k, v]) => (
                            <option key={k} value={k}>{v}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-3">
                        <input type="number" value={item.grossWeight || ""} onChange={(e) => updateItem(item.id, { grossWeight: parseFloat(e.target.value) || 0 })}
                          step="0.001" min="0" className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs text-right focus:outline-none focus:ring-1 focus:ring-burgundy-400" />
                      </td>
                      <td className="px-3 py-3">
                        <input type="number" value={item.stoneWeight || ""} onChange={(e) => updateItem(item.id, { stoneWeight: parseFloat(e.target.value) || 0 })}
                          step="0.001" min="0" className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs text-right focus:outline-none focus:ring-1 focus:ring-burgundy-400" />
                      </td>
                      <td className="px-3 py-3">
                        <input type="number" value={item.wastagePercent || ""} onChange={(e) => updateItem(item.id, { wastagePercent: parseFloat(e.target.value) || 0 })}
                          step="0.1" min="0" max="20" className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs text-right focus:outline-none focus:ring-1 focus:ring-burgundy-400" />
                      </td>
                      <td className="px-3 py-3 text-right text-xs text-slate-600 font-medium pt-4">{item.netWeight.toFixed(3)}</td>
                      <td className="px-3 py-3">
                        <input type="number" value={item.silverRate || ""} onChange={(e) => updateItem(item.id, { silverRate: parseFloat(e.target.value) || 0 })}
                          step="0.01" min="0" className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs text-right focus:outline-none focus:ring-1 focus:ring-burgundy-400" />
                      </td>
                      <td className="px-3 py-3">
                        <div className="space-y-1.5">
                          <div className="flex border border-slate-200 rounded-lg overflow-hidden text-xs w-fit">
                            {[{ v: "PER_GRAM", l: "₹/g" }, { v: "PERCENT", l: "%" }, { v: "FIXED", l: "Flat" }].map(({ v, l }) => (
                              <button key={v} type="button"
                                onClick={() => updateItem(item.id, { makingChargeType: v })}
                                className={`px-2 py-1 font-medium transition-colors ${item.makingChargeType === v ? "bg-slate-700 text-white" : "text-slate-600 hover:bg-slate-50"}`}>
                                {l}
                              </button>
                            ))}
                          </div>
                          <input type="number" value={item.makingChargeValue || ""} onChange={(e) => updateItem(item.id, { makingChargeValue: parseFloat(e.target.value) || 0 })}
                            step="0.5" min="0" placeholder="0"
                            className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs text-right focus:outline-none focus:ring-1 focus:ring-burgundy-400" />
                        </div>
                      </td>
                    </>
                  )}
                  <td className="px-3 py-3 text-right text-xs text-slate-700 font-medium pt-4">{formatCurrency(item.silverValue)}</td>
                  <td className="px-3 py-3 text-right text-xs text-slate-700 pt-4">{formatCurrency(item.makingAmount)}</td>
                  <td className="px-3 py-3 text-right text-xs text-slate-700 pt-4">{formatCurrency(item.gstAmount)}</td>
                  <td className="px-3 py-3 text-right text-sm font-bold text-slate-800 pt-4">{formatCurrency(item.itemTotal)}</td>
                  <td className="px-3 py-3 pt-4">
                    {items.length > 1 && (
                      <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-100">
          <button onClick={addItem} className="flex items-center gap-2 text-sm text-burgundy-600 hover:text-burgundy-700 font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Item
          </button>
        </div>
      </div>

      {/* Old Silver Exchange */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
        <label className="flex items-center gap-2 cursor-pointer mb-4">
          <input type="checkbox" checked={hasOldSilver} onChange={(e) => { setHasOldSilver(e.target.checked); markDirty(); }}
            className="w-4 h-4 accent-burgundy-500" />
          <span className="font-semibold text-slate-800">Old Silver Exchange / Trade-In</span>
        </label>
        {hasOldSilver && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 rounded-lg p-4">
            <div>
              <label className="block text-xs text-slate-600 mb-1">Old Silver Weight (g)</label>
              <input type="number" value={oldSilverWeight || ""} onChange={(e) => setOldSilverWeight(parseFloat(e.target.value) || 0)}
                step="0.001" min="0" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-burgundy-400" />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Purity</label>
              <select value={oldSilverPurity} onChange={(e) => { setOldSilverPurity(e.target.value); setOldSilverRate(getRate(latestRate, e.target.value)); }}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-burgundy-400">
                {Object.entries(PURITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Rate/g</label>
              <input type="number" value={oldSilverRate || ""} onChange={(e) => setOldSilverRate(parseFloat(e.target.value) || 0)}
                step="0.01" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-burgundy-400" />
            </div>
            <div className="sm:col-span-3 text-right text-sm font-semibold text-slate-700">
              Old Silver Value: {formatCurrency(oldSilverDeduction)}
            </div>
          </div>
        )}
      </div>

      {/* Bill Summary + Payment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Bill Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <h2 className="font-semibold text-slate-800 mb-4">Bill Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Silver Value</span>
              <span className="font-medium">{formatCurrency(items.reduce((s, i) => s + i.silverValue, 0))}</span>
            </div>
            {totalMaking > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-500">Making Charges</span>
                <span className="font-medium">{formatCurrency(totalMaking)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-400 text-xs">
              <span>Wastage Amount</span>
              <span>{formatCurrency(totalWastage)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-100 pt-2">
              <span className="text-slate-600">Subtotal</span>
              <span className="font-semibold">{formatCurrency(subtotal)}</span>
            </div>

            {/* GST breakup — only shown when CGST/SGST > 0 */}
            {gstPercent > 0 && (
              <div className="bg-blue-50 rounded-lg p-3 text-xs space-y-1">
                {(cgstPercent || 0) > 0 && (
                  <div className="flex justify-between text-blue-600">
                    <span>CGST ({cgstPercent}%)</span>
                    <span>{formatCurrency(totalGST * (cgstPercent || 0) / gstPercent)}</span>
                  </div>
                )}
                {(sgstPercent || 0) > 0 && (
                  <div className="flex justify-between text-blue-600">
                    <span>SGST ({sgstPercent}%)</span>
                    <span>{formatCurrency(totalGST * (sgstPercent || 0) / gstPercent)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-blue-700 border-t border-blue-200 pt-1">
                  <span>Total GST ({gstPercent}%)</span>
                  <span>{formatCurrency(totalGST)}</span>
                </div>
              </div>
            )}

            {/* Discount */}
            <div className="flex justify-between items-center gap-2">
              <span className="text-slate-500 shrink-0">Discount</span>
              <div className="flex items-center gap-2">
                <div className="flex border border-slate-200 rounded overflow-hidden text-xs">
                  <button onClick={() => setDiscountType("FLAT")}
                    className={`px-2 py-1 font-medium transition-colors ${discountType === "FLAT" ? "bg-slate-700 text-white" : "text-slate-600 hover:bg-slate-50"}`}>
                    ₹
                  </button>
                  <button onClick={() => setDiscountType("PERCENT")}
                    className={`px-2 py-1 font-medium transition-colors ${discountType === "PERCENT" ? "bg-slate-700 text-white" : "text-slate-600 hover:bg-slate-50"}`}>
                    %
                  </button>
                </div>
                <input type="number" value={discountValue}
                  onChange={(e) => { setDiscountValue(e.target.value === "" ? "" : parseFloat(e.target.value) || 0); markDirty(); }}
                  min="0" step="1" placeholder="0"
                  className="w-24 px-2 py-1 border border-slate-200 rounded text-right text-sm focus:outline-none focus:ring-1 focus:ring-burgundy-400" />
              </div>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-xs text-green-700">
                <span>Discount applied</span>
                <span>- {formatCurrency(discount)}</span>
              </div>
            )}

            {hasOldSilver && (
              <div className="flex justify-between text-green-600 text-sm">
                <span>Old Silver Exchange</span>
                <span>- {formatCurrency(oldSilverDeduction)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-400 text-xs">
              <span>Round Off</span>
              <span>{roundOff >= 0 ? "+" : ""}{roundOff.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-3 text-lg font-bold text-slate-800">
              <span>Total</span>
              <span className="text-burgundy-600">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        {/* Payment */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <h2 className="font-semibold text-slate-800 mb-4">Payment</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-600 mb-2">Payment Mode</label>
              <div className="grid grid-cols-3 gap-2">
                {PAYMENT_MODES.map((mode) => (
                  <button key={mode.value} onClick={() => setPaymentMode(mode.value)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                      paymentMode === mode.value
                        ? "bg-burgundy-500 border-burgundy-500 text-white shadow-sm"
                        : "border-slate-200 text-slate-600 hover:border-burgundy-300"
                    }`}>
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {paymentMode === "MULTIPLE" && (
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg">
                {[["Cash", cashAmount, setCashAmount], ["Card", cardAmount, setCardAmount], ["UPI", upiAmount, setUpiAmount], ["Cheque", chequeAmount, setChequeAmount]].map(([label, val, setter]) => (
                  <div key={label as string}>
                    <label className="text-xs text-slate-500">{label as string} (₹)</label>
                    <input type="number" value={(val as number) || ""} onChange={(e) => (setter as (v: number) => void)(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-slate-200 rounded text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-burgundy-400" />
                  </div>
                ))}
                <div className="col-span-2 text-right text-sm font-semibold text-slate-700">
                  Collected: {formatCurrency(cashAmount + cardAmount + upiAmount + chequeAmount)}
                  {(cashAmount + cardAmount + upiAmount + chequeAmount) < total && (
                    <span className="text-red-600 ml-2">Balance: {formatCurrency(total - cashAmount - cardAmount - upiAmount - chequeAmount)}</span>
                  )}
                </div>
              </div>
            )}

            {paymentMode === "CASH" && (
              <div className="bg-slate-50 rounded-lg p-3">
                <label className="text-xs text-slate-500">Amount Received (₹)</label>
                <input type="number" value={cashAmount || total} onChange={(e) => setCashAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-200 rounded text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-burgundy-400" />
                {cashAmount > total && (
                  <p className="text-green-600 font-semibold text-sm mt-2">Change: {formatCurrency(cashAmount - total)}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm text-slate-600 mb-1">Notes</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
                placeholder="Special instructions, occasion, etc."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-burgundy-400 resize-none" />
            </div>

            <div className="bg-slate-800 rounded-xl p-4 text-white text-center">
              <p className="text-slate-300 text-sm">Amount Due</p>
              <p className="text-3xl font-bold text-burgundy-300 mt-1">{formatCurrency(total)}</p>
              {paymentMode === "CREDIT" && (
                <p className="text-xs text-red-300 mt-1">To be collected later (Credit)</p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>
            )}

            {/* Estimate slip — share with customer before finalising */}
            <button
              type="button"
              onClick={() => setShowEstimate(true)}
              disabled={items.every((i) => !i.itemName.trim())}
              className="w-full border-2 border-burgundy-400 text-burgundy-600 font-semibold py-3 rounded-xl hover:bg-burgundy-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Print Estimate / Quote Slip
            </button>

            <button onClick={handleSave} disabled={loading}
              className="w-full bg-burgundy-500 hover:bg-burgundy-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-md disabled:opacity-70 text-lg">
              {loading ? "Saving Bill..." : "Confirm & Save Bill"}
            </button>
          </div>
        </div>
      </div>

      {/* Estimate Slip Modal */}
      {showEstimate && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center print:bg-transparent">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 flex flex-col max-h-[92vh] print:shadow-none print:max-w-full print:rounded-none print:mx-0">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 print:hidden">
              <div>
                <h3 className="font-bold text-slate-800">Estimate Slip</h3>
                <p className="text-xs text-slate-400">Share this with the customer for review</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-700"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print Slip
                </button>
                <button onClick={() => setShowEstimate(false)} className="text-slate-400 hover:text-slate-600 p-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              <EstimateSlipView
                quoteRef={quoteRef}
                customer={customer}
                items={items}
                subtotal={subtotal}
                totalMaking={totalMaking}
                totalGST={totalGST}
                cgstPercent={cgstPercent === "" ? 0 : cgstPercent}
                sgstPercent={sgstPercent === "" ? 0 : sgstPercent}
                discount={discount}
                oldSilverDeduction={oldSilverDeduction}
                oldSilverWeight={oldSilverWeight}
                oldSilverRate={oldSilverRate}
                roundOff={roundOff}
                total={total}
                silverRate999={latestRate?.rate999 || 0}
                validMinutes={60}
              />
            </div>
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 rounded-b-2xl print:hidden">
              <p className="text-xs text-slate-500 text-center">
                Once customer confirms, click <strong>Confirm &amp; Save Bill</strong> to finalise.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
