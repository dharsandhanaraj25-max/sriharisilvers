"use client";

import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

interface BarcodeDisplayProps {
  value: string;
  label?: string;
  height?: number;
  fontSize?: number;
  showValue?: boolean;
}

export function BarcodeDisplay({ value, label, height = 50, fontSize = 10, showValue = true }: BarcodeDisplayProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        JsBarcode(svgRef.current, value, {
          format: "CODE128",
          height,
          fontSize,
          displayValue: showValue,
          margin: 4,
          background: "#ffffff",
          lineColor: "#000000",
          textMargin: 3,
          font: "monospace",
        });
      } catch {
        // Invalid barcode value — silently ignore
      }
    }
  }, [value, height, fontSize, showValue]);

  return (
    <div className="flex flex-col items-center">
      <svg ref={svgRef} />
      {label && <p className="text-xs text-slate-500 mt-1 text-center">{label}</p>}
    </div>
  );
}
