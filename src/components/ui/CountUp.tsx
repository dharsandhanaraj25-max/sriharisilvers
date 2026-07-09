"use client";

import { useEffect, useRef, useState } from "react";
import { formatCurrency } from "@/lib/utils";

interface CountUpProps {
  value: number;
  /** "currency" renders ₹ with 2 decimals; "integer" rounds; "decimal" keeps `decimals` places. */
  format?: "currency" | "integer" | "decimal";
  decimals?: number;
  prefix?: string;
  suffix?: string;
  durationMs?: number;
}

/**
 * Animates a number from 0 to its final value on mount with an
 * ease-out curve. Renders the final value immediately when the
 * user prefers reduced motion.
 */
export function CountUp({
  value,
  format = "integer",
  decimals = 2,
  prefix = "",
  suffix = "",
  durationMs = 900,
}: CountUpProps) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value);
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(value * eased);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, durationMs]);

  const text =
    format === "currency"
      ? formatCurrency(display)
      : format === "decimal"
        ? display.toFixed(decimals)
        : Math.round(display).toLocaleString("en-IN");

  return <span>{prefix}{text}{suffix}</span>;
}
