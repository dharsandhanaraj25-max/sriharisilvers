"use client";

import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

interface BarcodeLabelPrintProps {
  product: {
    name: string;
    barcode: string;
    purity: string;
    netWeight: number;
    category: { name: string };
  };
  onClose: () => void;
}

export function BarcodeLabelPrint({ product, onClose }: BarcodeLabelPrintProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (svgRef.current) {
      JsBarcode(svgRef.current, product.barcode, {
        format: "CODE128",
        height: 60,
        fontSize: 11,
        displayValue: true,
        margin: 6,
        background: "#ffffff",
        lineColor: "#000000",
        textMargin: 4,
        font: "monospace",
      });
    }
  }, [product.barcode]);

  function handlePrint() {
    window.print();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 print:bg-transparent print:inset-auto print:fixed-none">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4 print:shadow-none print:p-0 print:rounded-none print:w-auto print:mx-0">
        {/* Screen controls */}
        <div className="flex items-center justify-between mb-4 print:hidden">
          <h3 className="font-semibold text-slate-800">Print Barcode Label</h3>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-burgundy-500 hover:bg-burgundy-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
              style={{ backgroundColor: "#800020" }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 px-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Label content — this prints */}
        <div
          id="barcode-label"
          className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center print:border-solid print:border-black print:rounded-none"
          style={{ width: "280px", margin: "0 auto" }}
        >
          <p className="text-xs font-bold text-slate-500 tracking-widest uppercase mb-1">SRIHARI SILVERS</p>
          <p className="font-bold text-slate-900 text-sm leading-tight mb-1">{product.name}</p>
          <div className="flex justify-center gap-3 text-xs text-slate-600 mb-2">
            <span className="font-medium">{product.purity} Purity</span>
            <span>·</span>
            <span>{product.netWeight.toFixed(3)}g</span>
            <span>·</span>
            <span>{product.category.name}</span>
          </div>
          <svg ref={svgRef} className="w-full" />
        </div>

        <p className="text-xs text-slate-400 text-center mt-3 print:hidden">
          Label size: 280px wide. Use label printer or cut after printing.
        </p>
      </div>
    </div>
  );
}
