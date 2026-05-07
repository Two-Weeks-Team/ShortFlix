import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** shadcn-style class composer. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** ISO 3166-1 alpha-2 -> readable display (subset; falls back to the code). */
const REGION_NAMES: Record<string, string> = {
  NG: "Lagos · NG",
  PT: "Lisbon · PT",
  CN: "Sichuan · CN",
  IS: "Reykjavík · IS",
  KR: "Seoul · KR",
  DE: "Berlin · DE",
  US: "United States",
  JP: "Japan",
  BR: "Brazil",
  IN: "India",
  ZA: "South Africa",
  MX: "Mexico",
};

export function regionLabel(alpha2: string): string {
  return REGION_NAMES[alpha2] ?? alpha2;
}

/** BCP-47 language tag -> short label. */
export function langLabel(tag: string): string {
  return tag.split("-")[0]?.toUpperCase() ?? tag.toUpperCase();
}

/** "0.82" novelty -> "0.82" (keeps two decimals). */
export function novelty(n: number): string {
  return n.toFixed(2);
}

/** Generate a UUID v4 for Idempotency-Key headers. */
export function uuidv4(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  // Fallback for older runtimes.
  const r = (n: number) => Math.floor(Math.random() * n);
  const hex = (n: number, len: number) => n.toString(16).padStart(len, "0");
  return `${hex(r(0xffffffff), 8)}-${hex(r(0xffff), 4)}-4${hex(
    r(0xfff),
    3
  )}-${hex(0x8 | r(0x3), 1)}${hex(r(0xfff), 3)}-${hex(
    r(0xffffffff),
    8
  )}${hex(r(0xffff), 4)}`;
}
