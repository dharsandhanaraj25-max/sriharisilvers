"use client";

import { formatCurrency, formatDateTime } from "@/lib/utils";

interface BillPrintViewProps {
  billNumber: string;
  customer: { name: string; phone: string } | null;
  items: {
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
    silverValue: number;
    makingAmount: number;
    gstAmount: number;
    itemTotal: number;
    isFixedPrice?: boolean;
  }[];
  subtotal: number;
  totalMaking: number;
  totalWastage: number;
  totalGST: number;
  cgstPercent?: number;
  sgstPercent?: number;
  discount: number;
  oldSilverDeduction: number;
  oldSilverWeight: number;
  oldSilverRate: number;
  roundOff: number;
  total: number;
  paymentMode: string;
  amountPaid: number;
  change: number;
  notes: string;
  silverRate999: number;
}

function toWords(n: number): string {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  if (n === 0) return "Zero";
  if (n < 0) return "Minus " + toWords(-n);
  let words = "";
  if (Math.floor(n / 10000000) > 0) { words += toWords(Math.floor(n / 10000000)) + " Crore "; n %= 10000000; }
  if (Math.floor(n / 100000) > 0) { words += toWords(Math.floor(n / 100000)) + " Lakh "; n %= 100000; }
  if (Math.floor(n / 1000) > 0) { words += toWords(Math.floor(n / 1000)) + " Thousand "; n %= 1000; }
  if (Math.floor(n / 100) > 0) { words += toWords(Math.floor(n / 100)) + " Hundred "; n %= 100; }
  if (n > 0) { if (words !== "") words += "and "; if (n < 20) words += ones[n]; else { words += tens[Math.floor(n / 10)]; if (n % 10 > 0) words += " " + ones[n % 10]; } }
  return words.trim();
}

export function BillPrintView({
  billNumber,
  customer,
  items,
  subtotal,
  totalMaking,
  totalGST,
  cgstPercent = 1.5,
  sgstPercent = 1.5,
  discount,
  oldSilverDeduction,
  oldSilverWeight,
  oldSilverRate,
  roundOff,
  total,
  paymentMode,
  amountPaid,
  change,
  notes,
  silverRate999,
}: BillPrintViewProps) {
  const now = new Date();
  const amountInWords = toWords(Math.round(total)) + " Rupees Only";
  const gstTotal = cgstPercent + sgstPercent;
  const showGST = gstTotal > 0 && totalGST > 0;

  return (
    <div className="bg-white text-slate-900 max-w-2xl mx-auto p-6 text-sm print:max-w-full print:p-4 print:text-xs">
      {/* Header */}
      <div className="text-center border-b-4 border-[#800020] pb-4 mb-4">
        <h1 className="text-2xl font-extrabold tracking-wide text-[#800020] print:text-xl">
          SRIHARI SILVERS
        </h1>
        <p className="text-sm text-slate-600 mt-1">Ammapet Main Road, Salem - 636 001, Tamil Nadu</p>
        <p className="text-sm text-slate-600">Ph: 9952797597</p>
        <div className="flex justify-center gap-6 mt-2 text-xs text-slate-500">
          <span>GSTIN: _______________</span>
          <span>HSN Code: 71131100</span>
        </div>
        <div className="mt-2">
          <span className="inline-block border border-slate-400 text-slate-700 text-xs px-3 py-0.5 tracking-widest font-medium">
            TAX INVOICE
          </span>
        </div>
      </div>

      {/* Bill Info */}
      <div className="flex justify-between mb-4">
        <div className="space-y-1">
          <div className="flex gap-2">
            <span className="text-slate-500 w-28">Bill No:</span>
            <span className="font-bold text-slate-800">{billNumber}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-slate-500 w-28">Date & Time:</span>
            <span className="font-medium" suppressHydrationWarning>{formatDateTime(now)}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-slate-500 w-28">Silver Rate:</span>
            <span className="font-medium">₹{silverRate999}/g (999 Purity)</span>
          </div>
        </div>
        <div className="space-y-1 text-right">
          <div className="flex gap-2 justify-end">
            <span className="text-slate-500">Customer:</span>
            <span className="font-bold text-slate-800">{customer?.name || "Walk-in Customer"}</span>
          </div>
          {customer?.phone && (
            <div className="flex gap-2 justify-end">
              <span className="text-slate-500">Phone:</span>
              <span>{customer.phone}</span>
            </div>
          )}
          <div className="flex gap-2 justify-end">
            <span className="text-slate-500">Payment:</span>
            <span className="font-medium">{paymentMode}</span>
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
              <th className="text-center px-2 py-2">HSN</th>
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
                <td className="px-2 py-1.5 font-medium">{item.itemName}</td>
                {item.isFixedPrice ? (
                  <td colSpan={7} className="px-2 py-1.5 text-center text-slate-400 italic">
                    Total Price
                  </td>
                ) : (
                  <>
                    <td className="px-2 py-1.5 text-center text-slate-500">{item.hsnCode}</td>
                    <td className="px-2 py-1.5 text-center">{item.purity}</td>
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
      <div className="flex gap-4 mb-4">
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
          </div>
        </div>

        {/* Amount Summary */}
        <div className="w-64 space-y-1 text-xs">
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

          {/* Conditional GST rows */}
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

          {/* Conditional discount */}
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
            <span>TOTAL</span>
            <span style={{ color: "#800020" }}>{formatCurrency(total)}</span>
          </div>
          {paymentMode === "CASH" && amountPaid > 0 && (
            <>
              <div className="flex justify-between py-1 text-slate-500">
                <span>Amount Received</span>
                <span>{formatCurrency(amountPaid)}</span>
              </div>
              {change > 0 && (
                <div className="flex justify-between py-1 text-green-600 font-medium">
                  <span>Balance Return</span>
                  <span>{formatCurrency(change)}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Amount in Words */}
      <div className="bg-slate-50 border border-slate-200 rounded p-2 mb-4 text-xs">
        <span className="font-semibold text-slate-700">Amount in Words: </span>
        <span className="text-slate-600 uppercase">{amountInWords}</span>
      </div>

      {notes && (
        <div className="mb-4 text-xs text-slate-500">
          <span className="font-semibold">Note: </span>{notes}
        </div>
      )}

      {/* Terms + Signature */}
      <div className="border-t border-slate-200 pt-3 mt-3 grid grid-cols-2 gap-4 text-xs text-slate-500">
        <div>
          <p className="font-semibold text-slate-700 mb-1">Terms & Conditions:</p>
          <ul className="space-y-0.5 list-disc list-inside">
            <li>Goods once sold will not be taken back</li>
            <li>Subject to Salem jurisdiction</li>
            <li>This is a computer generated bill</li>
            <li>GST as per Government norms</li>
          </ul>
        </div>
        <div className="text-right">
          <div className="mt-8 border-t border-slate-400 pt-1 inline-block min-w-32">
            <p className="text-slate-600 font-medium">Authorised Signature</p>
            <p className="font-semibold text-slate-800 mt-1">Srihari Silvers</p>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-slate-400 mt-4 pt-3 border-t border-slate-200">
        <p>Thank you for shopping with us! Visit Again</p>
        <p>Srihari Silvers | Ammapet Main Road, Salem - 636001 | Ph: 9952797597</p>
      </div>
    </div>
  );
}
