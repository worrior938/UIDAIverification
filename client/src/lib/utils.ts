import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-IN').format(num);
}

export function formatPercent(num: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'percent', minimumFractionDigits: 1 }).format(num / 100);
}
