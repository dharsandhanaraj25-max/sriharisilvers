"use client";

import { formatCurrency } from "@/lib/utils";

interface EstimateItem {
  itemName: string;
  purity: string;
  grossWeight: number;
  stoneWeight: number;
  netWeight: number;
  wastagePercent: number;
  wastageWeight: number;
  silverRate: number;
  makingChargeType: string;
  makingChargeValue: number;
  quantity: number;
  silverValue: number;
  makingAmount: number;
  gstAmount: number;
  itemTotal: number;
  isFixedPrice?: boolean;
}

interface EstimateSlipViewProps {
  quoteRef: string;
  customer: { name: string; phone: string } | null;
  items: EstimateItem[];
  subtotal: number;
  totalMaking: number;
  totalGST: number;
  cgstPercent: number;
  sgstPercent: number;
  discount: number;
  oldSilverDeduction: number;
  oldSilverWeight: number;
  oldSilverRate: number;
  roundOff: number;
  total: number;
  silverRate999: number;
  validMinutes?: number;
}

const PURITY_LABEL: Record<string, string> = {
  "999": "999 (Fine)",
  "925": "925 (Sterling)",
  "916": "916",
  "875": "875",
  "800": "800",
};

export function EstimateSlipView({
  quoteRef,
  customer,
  items,
  subtotal,
  totalMaking,
  totalGST,
  cgstPercent,
  sgstPercent,
  discount,
  oldSilverDeduction,
  oldSilverWeight,
  oldSilverRate,
  roundOff,
  total,
  silverRate999,
  validMinutes = 60,
}: EstimateSlipViewProps) {
  const now = new Date();
  const gstTotal = cgstPercent + sgstPercent;
  const showGST = gstTotal > 0 && totalGST > 0;
  const dateStr = now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  return (
    <div id="estimate-slip-content" className="bg-white text-slate-900 max-w-2xl mx-auto p-6 text-sm print:max-w-full print:p-4 print:text-xs">
      {/* Header */}
      <div className="text-center border-b-4 border-[#800020] pb-4 mb-4">
        <h1 className="text-2xl font-extrabold tracking-wide text-[#800020] print:text-xl">
          SRIHARI SILVERS
        </h1>
        <p className="text-sm text-slate-600 mt-1">Ammapet Main Road, Salem - 636 001, Tamil Nadu</p>
        <p className="text-sm text-slate-600">Ph: 9952797597</p>
        <div className="mt-2 flex flex-col items-center gap-1">
          <span className="inline-block border-2 border-[#800020] text-[#800020] text-xs px-4 py-0.5 tracking-widest font-bold">
            ESTIMATE SLIP
          </span>
          <span className="text-xs text-slate-400 font-medium tracking-wide">NOT A TAX INVOICE</span>
        </div>
      </div>

      {/* Bill Info */}
      <div className="flex justify-between mb-4">
        <div className="space-y-1">
          <div className="flex gap-2">
            <span className="text-slate-500 w-28">Quote Ref:</span>
            <span className="font-bold text-slate-800">{quoteRef}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-slate-500 w-28">Date:</span>
            <span className="font-medium">{dateStr}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-slate-500 w-28">Time:</span>
            <span className="font-medium">{timeStr}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-slate-500 w-28">Silver Rate:</span>
            <span className="font-medium">₹{silverRate999}/g (999 Purity)</span>
          </div>
        </div>
        <div className="space-y-1 text-right">
          {customer && (
            <>
              <div className="flex gap-2 justify-end">
                <span className="text-slate-500">Customer:</span>
                <span className="font-bold text-slate-800">{customer.name}</span>
              </div>
              <div className="flex gap-2 justify-end">
                <span className="text-slate-500">Phone:</span>
                <span>{customer.phone}</span>
              </div>
            </>
          )}
          <div className="flex gap-2 justify-end text-[#800020]">
            <span className="font-semibold text-xs mt-1">
              Valid for {validMinutes < 60 ? `${validMinutes} min` : `${validMinutes / 60} hr`} from issue
            </span>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="border border-slate-300 rounded overflow-hidden mb-4">
        <table className="w-full text-xs">
          <thead style={{ backgroundColor: "#800020" }} className="text-white">
            <tr>
              <th className="text-left px-2 py-2 w-6">#</th>
              <th className="text-left px-2 py-2">Item Description</th>
              <th className="text-center px-2 py-2">Purity</th>
              <th className="text-right px-2 py-2">Gr.Wt</th>
              <th className="text-right px-2 py-2">St.Wt</th>
              <th className="text-right px-2 py-2">Net Wt</th>
              <th className="text-right px-2 py-2">Rate</th>
              <th className="text-right px-2 py-2">Making</th>
              <th className="text-right px-2 py-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                <td className="px-2 py-1.5 text-center">{i + 1}</td>
                <td className="px-2 py-1.5 font-medium">
                  {item.itemName}
                  {item.quantity > 1 && <span className="text-slate-400 ml-1">×{item.quantity}</span>}
                </td>
                {item.isFixedPrice ? (
                  <td colSpan={6} className="px-2 py-1.5 text-center text-slate-400 italic">
                    Total Price
                  </td>
                ) : (
                  <>
                    <td className="px-2 py-1.5 text-center">{PURITY_LABEL[item.purity] || item.purity}</td>
                    <td className="px-2 py-1.5 text-right">{item.grossWeight.toFixed(3)}g</td>
                    <td className="px-2 py-1.5 text-right">{item.stoneWeight.toFixed(3)}g</td>
                    <td className="px-2 py-1.5 text-right font-medium">{item.netWeight.toFixed(3)}g</td>
                    <td className="px-2 py-1.5 text-right">₹{item.silverRate.toFixed(2)}</td>
                    <td className="px-2 py-1.5 text-right">
                      {item.makingChargeValue > 0
                        ? item.makingChargeType === "PER_GRAM"
                          ? `₹${item.makingChargeValue}/g`
                          : item.makingChargeType === "PERCENT"
                          ? `${item.makingChargeValue}%`
                          : `₹${item.makingChargeValue}`
                        : "—"}
                    </td>
                  </>
                )}
                <td className="px-2 py-1.5 text-right font-semibold">{formatCurrency(item.itemTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        {/* Weight Summary */}
        <div className="flex-1 bg-slate-50 border border-slate-200 rounded p-3">
          <p className="font-semibold text-slate-700 mb-2 text-xs">Weight Summary</p>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Total Gross Weight</span>
              <span className="font-medium">{items.reduce((s, i) => s + i.grossWeight, 0).toFixed(3)}g</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total Stone Weight</span>
              <span className="font-medium">{items.reduce((s, i) => s + i.stoneWeight, 0).toFixed(3)}g</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total Net Weight</span>
              <span className="font-bold">{items.reduce((s, i) => s + i.netWeight, 0).toFixed(3)}g</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-200">
              <span className="text-slate-500">Total Items</span>
              <span className="font-medium">{items.reduce((s, i) => s + i.quantity, 0)}</span>
            </div>
          </div>
        </div>

        {/* Amount Summary */}
        <div className="w-full sm:w-64 space-y-1 text-xs">
          <div className="flex justify-between py-1">
            <span className="text-slate-500">Silver Value</span>
            <span>{formatCurrency(items.reduce((s, i) => s + i.silverValue, 0))}</span>
          </div>
          {totalMaking > 0 && (
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Making Charges</span>
              <span>{formatCurrency(totalMaking)}</span>
            </div>
          )}
          <div className="flex justify-between py-1 border-t border-slate-200">
            <span className="text-slate-600 font-medium">Sub Total</span>
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>

          {showGST && cgstPercent > 0 && (
            <div className="flex justify-between py-1">
              <span className="text-slate-500">CGST @ {cgstPercent}%</span>
              <span>{formatCurrency(totalGST * cgstPercent / gstTotal)}</span>
            </div>
          )}
          {showGST && sgstPercent > 0 && (
            <div className="flex justify-between py-1">
              <span className="text-slate-500">SGST @ {sgstPercent}%</span>
              <span>{formatCurrency(totalGST * sgstPercent / gstTotal)}</span>
            </div>
          )}

          {discount > 0 && (
            <div className="flex justify-between py-1 text-green-600">
              <span>Discount</span>
              <span>- {formatCurrency(discount)}</span>
            </div>
          )}
          {oldSilverDeduction > 0 && (
            <div className="flex justify-between py-1 text-green-600">
              <span>Old Silver ({oldSilverWeight.toFixed(3)}g @ ₹{oldSilverRate})</span>
              <span>- {formatCurrency(oldSilverDeduction)}</span>
            </div>
          )}
          {roundOff !== 0 && (
            <div className="flex justify-between py-1 text-slate-400">
              <span>Round Off</span>
              <span>{roundOff >= 0 ? "+" : ""}{roundOff.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between py-2 border-t-2 border-[#800020] text-base font-bold">
            <span>ESTIMATE TOTAL</span>
            <span style={{ color: "#800020" }}>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {/* Notice box */}
      <div className="border border-dashed border-[#800020] rounded p-3 mb-4 bg-red-50 text-xs">
        <div className="flex items-start gap-2">
          <span className="font-bold text-[#800020]">NOTICE:</span>
          <span className="text-slate-600">
            This is a <strong>price estimate only</strong>. Rates are subject to change based on live silver prices.
            Final invoice will be generated upon payment. Valid for {validMinutes < 60 ? `${validMinutes} minutes` : `${validMinutes / 60} hour(s)`} from time of issue.
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 pt-3 mt-3 grid grid-cols-2 gap-4 text-xs text-slate-500">
        <div>
          <p className="font-semibold text-slate-700 mb-1">Thank you!</p>
          <p>Kindly confirm payment to proceed with your purchase.</p>
          <p className="mt-1">For queries: <span className="font-medium">9952797597</span></p>
        </div>
        <div className="text-right">
          <div className="mt-4 border-t border-slate-400 pt-1 inline-block min-w-32">
            <p className="text-slate-600 font-medium">Prepared by</p>
            <p className="font-semibold text-slate-800 mt-1">Srihari Silvers</p>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-slate-400 mt-4 pt-3 border-t border-slate-200">
        <p className="font-semibold text-slate-500">— ESTIMATE SLIP — NOT A TAX INVOICE —</p>
        <p className="mt-1">Srihari Silvers | Ammapet Main Road, Salem - 636001 | Ph: 9952797597</p>
      </div>
    </div>
  );
}
