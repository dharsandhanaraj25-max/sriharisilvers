"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface VoidButtonProps {
  saleId: string;
  billNumber: string;
}

export function VoidButton({ saleId, billNumber }: VoidButtonProps) {
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const router = useRouter();

  const handleVoid = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/sales/${saleId}/void`, { method: "POST" });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to void bill");
      }
    } finally {
      setLoading(false);
      setConfirm(false);
    }
  };

  if (confirm) {
    return (
      <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
        <span className="text-xs text-red-700 font-medium">Void Bill #{billNumber}?</span>
        <button
          onClick={handleVoid}
          disabled={loading}
          className="bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? "..." : "Confirm"}
        </button>
        <button
          onClick={() => setConfirm(false)}
          className="text-slate-500 px-2 py-1 rounded text-xs hover:bg-slate-100"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      className="border border-red-300 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-50 flex items-center gap-2"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
      Void Bill
    </button>
  );
}
