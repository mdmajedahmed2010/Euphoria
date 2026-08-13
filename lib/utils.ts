import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Euphoria — Custom Utility Functions
 */

import { CURRENCY } from "./constants";

/**
 * Format price with BDT currency symbol
 */
export function formatPrice(amount: number): string {
  return `${CURRENCY.SYMBOL}${amount.toLocaleString("en-BD")}`;
}

/**
 * Generate URL-friendly slug from text
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Generate unique SKU
 * Format: CAT-PROD-COLOR-SIZE (e.g., BRK-001-BLK-M)
 */
export function generateSKU(
  categoryPrefix: string,
  productNumber: number,
  color?: string,
  size?: string
): string {
  const parts = [
    categoryPrefix.toUpperCase().slice(0, 3),
    String(productNumber).padStart(3, "0"),
  ];

  if (color) parts.push(color.toUpperCase().slice(0, 3));
  if (size) parts.push(size.toUpperCase());

  return parts.join("-");
}

/**
 * Generate order number
 * Format: ORD-2026-00001
 */
export function generateOrderNumber(sequentialId: number): string {
  const year = new Date().getFullYear();
  return `ORD-${year}-${String(sequentialId).padStart(5, "0")}`;
}

/**
 * Validate Bangladesh phone number
 */
export function isValidBDPhone(phone: string): boolean {
  return /^(\+880|0)1[3-9]\d{8}$/.test(phone);
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

/**
 * Calculate delivery charge based on city
 */
export function calculateDeliveryCharge(city: string): number {
  const dhakaAreas = ["dhaka", "ঢাকা"];
  const isInsideDhaka = dhakaAreas.some((area) =>
    city.toLowerCase().includes(area)
  );
  return isInsideDhaka ? 80 : 150;
}

/**
 * Delay utility
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
