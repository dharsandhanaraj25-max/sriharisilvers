"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ReturnDialog } from "./ReturnDialog";

interface SaleItem {
  id: string;
  itemName: string;
  quantity: number;
  netWeight: number;
  purity: string;
  itemTotal: number;
}

interface ReturnButtonProps {
  saleId: string;
  billNumber: string;
  items: SaleItem[];
  total: number;
}

export function ReturnButton({ saleId, billNumber, items, total }: ReturnButtonProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
        Return Items
      </button>

      {open && (
        <ReturnDialog
          saleId={saleId}
          billNumber={billNumber}
          items={items}
          total={total}
          onSuccess={() => {
            setOpen(false);
            router.refresh();
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
