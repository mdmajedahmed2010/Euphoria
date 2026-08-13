/**
 * Euphoria — Application Constants
 * Dhaka, Bangladesh — Premium Pakistani Luxury Suits & Designer Festive Wear
 */

// Delivery Charges (BDT)
export const DELIVERY_CHARGE = {
  DHAKA_INSIDE: 80,
  OUTSIDE_DHAKA: 150,
} as const;

// Order Number Prefix
export const ORDER_PREFIX = "DN";

// Product Status
export const PRODUCT_STATUS = {
  DRAFT: "DRAFT",
  ACTIVE: "ACTIVE",
  OUT_OF_STOCK: "OUT_OF_STOCK",
  ARCHIVED: "ARCHIVED",
} as const;

// Order Status
export const ORDER_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  PROCESSING: "PROCESSING",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
  RETURNED: "RETURNED",
  REFUNDED: "REFUNDED",
} as const;

// Payment Methods
export const PAYMENT_METHOD = {
  COD: "COD",
  BKASH: "BKASH",
  NAGAD: "NAGAD",
  SSLCOMMERZ: "SSLCOMMERZ",
} as const;

// Rate Limiting
export const RATE_LIMITS = {
  LOGIN: { requests: 5, window: "15m" },
  REGISTER: { requests: 3, window: "1h" },
  PASSWORD_RESET: { requests: 3, window: "1h" },
  CHECKOUT: { requests: 10, window: "1m" },
  API: { requests: 100, window: "1m" },
  ADMIN: { requests: 50, window: "1m" },
} as const;

// Image Upload Limits
export const UPLOAD_LIMITS = {
  MAX_SIZE_MB: 10,
  MAX_SIZE_BYTES: 10 * 1024 * 1024,
  ALLOWED_TYPES: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  ALLOWED_EXTENSIONS: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
  MAX_DIMENSION: 4000,
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 48,
} as const;

// Session & Auth
export const AUTH = {
  ACCESS_TOKEN_EXPIRY: 15 * 60,
  REFRESH_TOKEN_EXPIRY: 7 * 24 * 60 * 60,
  ADMIN_SESSION_TIMEOUT: 30 * 60,
  BCRYPT_SALT_ROUNDS: 12,
  PASSWORD_RESET_EXPIRY: 60 * 60,
} as const;

// Business Info — Euphoria
export const BUSINESS = {
  NAME: "Euphoria",
  NAME_BN: "ইউফোরিয়া",
  TAGLINE: "Dressing well is a form of good manners.",
  PHONE: "01903-888804",
  EMAIL: "info@euphoriabd.com",
  ADDRESS: "Mirpur, Dhaka, Bangladesh",
  FACEBOOK: "https://www.facebook.com/Euphoria2222",
  INSTAGRAM: "https://www.instagram.com/euphoria",
  YOUTUBE: "",
  WEBSITE: "https://euphoriabd.com",
  ESTABLISHED: "Mirpur, Dhaka, Bangladesh",
  FOLLOWERS: "61K",
  RECOMMEND_RATE: "96%",
} as const;

// Currency
export const CURRENCY = {
  CODE: "BDT",
  SYMBOL: "৳",
  LOCALE: "en-BD",
} as const;

// Coupon Codes
export const COUPON_CODES: Record<
  string,
  { type: "percent" | "flat"; value: number; label: string }
> = {
  STYLE10: { type: "percent", value: 10, label: "10% off your order" },
  STYLE15: { type: "percent", value: 15, label: "15% off your order" },
  EID2026: { type: "percent", value: 15, label: "15% Eid Special Discount" },
  WELCOME5: { type: "percent", value: 5, label: "5% Welcome Discount" },
  FLAT500: { type: "flat", value: 500, label: "৳500 flat discount" },
} as const;

