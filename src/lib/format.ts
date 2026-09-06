/**
 * Formatting helpers shared by server and client components.
 *
 * Dates are handled as plain `YYYY-MM-DD` strings and never passed through
 * `new Date("YYYY-MM-DD")`, which parses as UTC and shifts the day backwards
 * for anyone east of Greenwich — including Pakistan (UTC+5).
 */

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

/** PostgREST can return `numeric` as a string; coerce defensively. */
export function toNumber(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

const grouped = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** `115000` -> `"115,000"` */
export function formatNumber(value: unknown): string {
  return grouped.format(toNumber(value));
}

/** `115000` -> `"Rs 115,000"` */
export function formatMoney(value: unknown): string {
  const n = toNumber(value);
  const sign = n < 0 ? "-" : "";
  return `${sign}Rs ${grouped.format(Math.abs(n))}`;
}

/** Compact form for tight spaces: `1250000` -> `"Rs 1.25M"` */
export function formatMoneyCompact(value: unknown): string {
  const n = toNumber(value);
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}Rs ${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 100_000) return `${sign}Rs ${(abs / 1_000).toFixed(0)}K`;
  return formatMoney(n);
}

/** `"2026-09-05"` -> `"05-Sep-2026"` (the format used across the app). */
export function formatDate(iso: string | null | undefined): string {
  const parts = parseISODate(iso);
  if (!parts) return "—";
  const [y, m, d] = parts;
  return `${String(d).padStart(2, "0")}-${MONTHS[m - 1]}-${y}`;
}

/** `"2026-09-05"` -> `"Saturday, 05 Sep 2026"` */
export function formatDateLong(iso: string | null | undefined): string {
  const parts = parseISODate(iso);
  if (!parts) return "—";
  const [y, m, d] = parts;
  const weekday = new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "long",
  });
  return `${weekday}, ${String(d).padStart(2, "0")} ${MONTHS[m - 1]} ${y}`;
}

/** Splits `YYYY-MM-DD` into `[year, month, day]`, or null if malformed. */
export function parseISODate(
  iso: string | null | undefined,
): [number, number, number] | null {
  if (!iso) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  return [y, m, d];
}

export function isValidISODate(iso: string | null | undefined): boolean {
  return parseISODate(iso) !== null;
}

/** Today in the server's local timezone, as `YYYY-MM-DD`. */
export function todayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Moves a `YYYY-MM-DD` string by whole days, staying in local time. */
export function shiftISODate(iso: string, days: number): string {
  const parts = parseISODate(iso);
  if (!parts) return iso;
  const [y, m, d] = parts;
  const shifted = new Date(y, m - 1, d + days);
  const yy = shifted.getFullYear();
  const mm = String(shifted.getMonth() + 1).padStart(2, "0");
  const dd = String(shifted.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

export const BILL_STATUS_LABELS = {
  pending: "Pending",
  partially_paid: "Partially paid",
  paid: "Paid",
} as const;

const QTY_UNITS =
  "bags?|bag|pcs?|pieces?|kg|kgs|tons?|tonnes?|trolleys?|trips?|ft|rft|sft|cft|" +
  "nos?|units?|bundles?|rolls?|litres?|liters?|ltr|drums?|sheets?|coils?|loads?|" +
  "dozen|doz|cartons?|cans?|tins?|packs?|boxes?|box";

const QTY_RE = new RegExp(
  `(\\d[\\d,]*(?:\\.\\d+)?)\\s*(${QTY_UNITS})\\b`,
  "i",
);

/**
 * Pulls a quantity out of an item name when one was written there, e.g.
 * "Cement (Bestway, 210 bags)" -> "210 bags". Returns "" when none is found —
 * quantity is optional, and the app never stored it as a separate field.
 */
export function extractQuantity(material: string): string {
  const match = QTY_RE.exec(material);
  if (!match) return "";
  return `${match[1].replace(/,/g, "")} ${match[2].toLowerCase()}`;
}
