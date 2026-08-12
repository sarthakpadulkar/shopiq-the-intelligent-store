export function inr(value: number | string | null | undefined): string {
  const n = typeof value === "string" ? Number(value) : (value ?? 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(n) ? n : 0);
}

export function compact(value: number | null | undefined): string {
  return new Intl.NumberFormat("en-IN", { notation: "compact" }).format(value ?? 0);
}

export function pct(value: number | null | undefined, digits = 1): string {
  if (!Number.isFinite(value ?? NaN)) return "—";
  return `${(value as number).toFixed(digits)}%`;
}

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export function stockStatus(units: number | null | undefined): StockStatus {
  const u = units ?? 0;
  if (u <= 0) return "out_of_stock";
  if (u <= 5) return "low_stock";
  return "in_stock";
}

export const stockLabel: Record<StockStatus, string> = {
  in_stock: "In stock",
  low_stock: "Low stock",
  out_of_stock: "Out of stock",
};
