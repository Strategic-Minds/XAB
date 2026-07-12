import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  // Use UTC fields so server and client always produce the same string,
  // regardless of the runtime's local timezone.
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

export function formatRelativeTime(date: Date | string): string {
  // formatRelativeTime compares against "now" which changes on every render —
  // it must only be called client-side. Fall back to formatDate for SSR safety.
  if (typeof window === "undefined") return formatDate(date);
  const now = new Date();
  const d = new Date(date);
  const diff = (now.getTime() - d.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return formatDate(date);
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function truncate(str: string, length = 50): string {
  return str.length > length ? `${str.slice(0, length)}...` : str;
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}

/** SWR fetcher — throws on non-2xx so SWR's fallback default is used correctly. */
export async function fetcher(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}
