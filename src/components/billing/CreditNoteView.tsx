"use client";

import { formatCurrency } from "@/lib/utils";

interface CreditNoteItem {
  id: string;
  itemName: string;
  quantity: number;
  netWeight: number;
  refundAmount: number;
  restocked: boolean;
}

interface CreditNoteViewProps {
  returnNumber: string;
  returnDate: string;
  billNumber: string;
  customer: { name: string; phone: string } | null;
  items: CreditNoteItem[];
  refundAmount: number;
  refundMode: string;
  reason: string;
  notes?: string;
  createdBy: string;
}

const REFUND_MODE_LABELS: Record<string, string> = {
  CASH: "Cash",
  UPI: "UPI / GPay",
  BANK_TRANSFER: "Bank Transfer",
  CREDIT: "Store Credit",
};

export function CreditNoteView({
  returnNumber,
  returnDate,
  billNumber,
  customer,
  items,
  refundAmount,
  refundMode,
  reason,
  notes,
  createdBy,
}: CreditNoteViewProps) {
  const dateStr = new Date(returnDate).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="font-mono text-sm p-8 max-w-2xl mx-auto bg-white">
      {/* Header */}
      <div className="text-center mb-6 border-b-2 border-slate-800 pb-4">
        <h1 className="text-2xl font-bold tracking-wide text-slate-800">SRIHARI SILVERS</h1>
        <p className="text-xs text-slate-500 mt-1">Ammapet Main Road, Salem – 636001, Tamil Nadu</p>
        <p className="text-xs text-slate-500">Ph: 9952797597</p>
        <div className="mt-3">
          <span className="inline-block bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full border border-red-300 tracking-widest">
            CREDIT NOTE
          </span>
        </div>
      </div>

      {/* Meta */}
      <div className="flex justify-between mb-5 text-xs">
        <div className="space-y-1">
          <p><span className="text-slate-500">Credit Note No:</span> <strong>{returnNumber}</strong></p>
          <p><span className="text-slate-500">Against Bill:</span> <strong>#{billNumber}</strong></p>
          <p><span className="text-slate-500">Date:</span> {dateStr}</p>
          <p><span className="text-slate-500">Reason:</span> {reason}</p>
        </div>
        <div className="space-y-1 text-right">
          {customer && (
            <>
              <p className="font-semibold text-slate-800">{customer.name}</p>
              <p className="text-slate-500">{customer.phone}</p>
            </>
          )}
        </div>
      </div>

      {/* Items */}
      <table className="w-full text-xs mb-5 border-collapse">
        <thead>
          <tr className="border-t border-b border-slate-300 bg-slate-50">
            <th className="text-left py-2 px-1">#</th>
            <th className="text-left py-2 px-1">Item</th>
            <th className="text-center py-2 px-1">Qty</th>
            <th className="text-right py-2 px-1">Weight (g)</th>
            <th className="text-center py-2 px-1">Restocked</th>
            <th className="text-right py-2 px-1">Refund</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={item.id} className="border-b border-slate-100">
              <td className="py-2 px-1 text-slate-500">{idx + 1}</td>
              <td className="py-2 px-1 text-slate-800">{item.itemName}</td>
              <td className="py-2 px-1 text-center">{item.quantity}</td>
              <td className="py-2 px-1 text-right">{item.netWeight.toFixed(3)}</td>
              <td className="py-2 px-1 text-center">
                {item.restocked ? (
                  <span className="text-green-600 font-semibold">Yes</span>
                ) : (
                  <span className="text-slate-400">No</span>
                )}
              </td>
              <td className="py-2 px-1 text-right font-semibold">{formatCurrency(item.refundAmount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="border-t-2 border-slate-800 pt-3 flex justify-end">
        <div className="space-y-1 text-xs w-full max-w-[220px]">
          <div className="flex justify-between font-bold text-base border-t border-slate-300 pt-1 mt-1">
            <span>Total Refund</span>
            <span className="text-red-700">{formatCurrency(refundAmount)}</span>
          </div>
          <div className="flex justify-between text-slate-500 text-xs">
            <span>Refund Mode</span>
            <span className="font-semibold">{REFUND_MODE_LABELS[refundMode] || refundMode}</span>
          </div>
        </div>
      </div>

      {notes && (
        <div className="mt-4 text-xs text-slate-500 border-t border-slate-200 pt-3">
          <span className="font-medium text-slate-700">Notes: </span>{notes}
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-slate-200 flex justify-between text-xs text-slate-400">
        <p>Processed by: {createdBy}</p>
        <p>This is a computer-generated credit note</p>
      </div>
    </div>
  );
}
