const LAKH = 100_000;
const CRORE = 10_000_000;

/** Compact Pakistani price notation: "PKR 12.5 Crore", "PKR 2.8 Lakh". */
export function formatPrice(price: number, unit: "total" | "month" | string = "total"): string {
  const suffix = unit === "month" ? " / month" : "";
  if (price >= CRORE) {
    const value = price / CRORE;
    return `PKR ${trim(value)} Crore${suffix}`;
  }
  if (price >= LAKH) {
    const value = price / LAKH;
    return `PKR ${trim(value)} Lakh${suffix}`;
  }
  return `PKR ${price.toLocaleString("en-PK")}${suffix}`;
}

export function formatPriceShort(price: number, unit: "total" | "month" | string = "total"): string {
  const suffix = unit === "month" ? "/mo" : "";
  if (price >= CRORE) return `Rs ${trim(price / CRORE)} Cr${suffix}`;
  if (price >= LAKH) return `Rs ${trim(price / LAKH)} Lac${suffix}`;
  return `Rs ${price.toLocaleString("en-PK")}${suffix}`;
}

function trim(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  return rounded % 1 === 0 ? rounded.toFixed(0) : String(rounded);
}

/** "10 Marla (2,250 sq ft)", "5,500 sq ft", "1 Kanal". */
export function formatArea(value: number, unit: string, sqft?: number): string {
  if (unit === "marla") return `${trim(value)} Marla${sqft ? ` (${sqft.toLocaleString("en-PK")} sq ft)` : ""}`;
  if (unit === "kanal") return `${trim(value)} Kanal${sqft ? ` (${sqft.toLocaleString("en-PK")} sq ft)` : ""}`;
  return `${Math.round(value).toLocaleString("en-PK")} sq ft`;
}

export function formatNumber(value: number): string {
  return value.toLocaleString("en-PK");
}

export function formatDate(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return `${formatNumber(count)} ${count === 1 ? singular : (plural ?? `${singular}s`)}`;
}

/** Approximate mortgage instalment using a standard amortising formula. */
export function monthlyInstalment(principal: number, annualRatePct: number, years: number): number {
  const months = Math.max(1, Math.round(years * 12));
  const monthlyRate = annualRatePct / 100 / 12;
  if (monthlyRate === 0) return principal / months;
  return (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
}
