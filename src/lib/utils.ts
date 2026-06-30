import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatWeight(weight: number, unit = "g"): string {
  return `${weight.toFixed(3)} ${unit}`;
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), "dd/MM/yyyy");
}

export function formatDateTime(date: Date | string): string {
  return format(new Date(date), "dd/MM/yyyy hh:mm a");
}

export function generateBillNumber(prefix: string, count: number): string {
  const year = new Date().getFullYear().toString().slice(-2);
  const month = String(new Date().getMonth() + 1).padStart(2, "0");
  return `${prefix}${year}${month}${String(count).padStart(4, "0")}`;
}

// Purity multipliers for calculating rate
export const PURITY_MAP: Record<string, number> = {
  "999": 1.0,
  "925": 0.925,
  "916": 0.916,
  "875": 0.875,
  "800": 0.8,
};

export const PURITY_LABELS: Record<string, string> = {
  "999": "999 (Pure Silver)",
  "925": "925 (Sterling Silver)",
  "916": "916",
  "875": "875",
  "800": "800",
};

export const GST_RATES = {
  silver: 3,       // GST on silver jewellery (HSN 7113)
  makingCharges: 5, // GST on making charges
};

export const HSN_CODES = {
  silverJewellery: "71131100",
  silverBars: "71061000",
};

// Calculate silver value for an item
export interface SilverCalculation {
  grossWeight: number;
  stoneWeight: number;
  wastagePercent: number;
  purity: string;
  silverRate: number; // rate per gram for 999 purity
  makingChargeType: "PER_GRAM" | "PERCENT" | "FIXED";
  makingChargeValue: number;
  quantity: number;
  gstPercent: number;
}

export interface SilverCalculationResult {
  netWeight: number;
  wastageWeight: number;
  chargeableWeight: number;
  purityFactor: number;
  effectiveRate: number;
  silverValue: number;
  makingAmount: number;
  subtotal: number;
  gstAmount: number;
  itemTotal: number;
}

export function calculateSilverItem(calc: SilverCalculation): SilverCalculationResult {
  const { grossWeight, stoneWeight, wastagePercent, purity, silverRate,
          makingChargeType, makingChargeValue, quantity, gstPercent } = calc;

  const netWeight = grossWeight - stoneWeight;
  const wastageWeight = (netWeight * wastagePercent) / 100;
  const chargeableWeight = netWeight + wastageWeight;
  const purityFactor = PURITY_MAP[purity] || 1;
  const effectiveRate = silverRate * purityFactor;

  const silverValue = chargeableWeight * effectiveRate * quantity;

  let makingAmount = 0;
  if (makingChargeType === "PER_GRAM") {
    makingAmount = netWeight * makingChargeValue * quantity;
  } else if (makingChargeType === "PERCENT") {
    makingAmount = (silverValue * makingChargeValue) / 100;
  } else {
    makingAmount = makingChargeValue * quantity;
  }

  const subtotal = silverValue + makingAmount;
  const gstAmount = (subtotal * gstPercent) / 100;
  const itemTotal = subtotal + gstAmount;

  return {
    netWeight,
    wastageWeight,
    chargeableWeight,
    purityFactor,
    effectiveRate,
    silverValue,
    makingAmount,
    subtotal,
    gstAmount,
    itemTotal,
  };
}

export const PAYMENT_MODES = [
  { value: "CASH", label: "Cash" },
  { value: "CARD", label: "Card (Debit/Credit)" },
  { value: "UPI", label: "UPI (PhonePe/GPay/Paytm)" },
  { value: "CHEQUE", label: "Cheque" },
  { value: "CREDIT", label: "Credit (Book Debt)" },
  { value: "MULTIPLE", label: "Multiple Modes" },
];

export const EXPENSE_CATEGORIES = [
  "Rent",
  "Electricity",
  "Salary",
  "Transport",
  "Packaging",
  "Advertisement",
  "Maintenance",
  "Bank Charges",
  "Insurance",
  "Miscellaneous",
];
