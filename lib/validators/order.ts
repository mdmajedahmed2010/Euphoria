/**
 * Euphoria — Order Validation Schemas (Zod)
 * SOP §৪B — Input Validation
 * 
 * Key: Order করতে login দরকার নেই (Guest-first)
 */

import { z } from "zod";

const bdPhoneRegex = /^(\+880|0)1[3-9]\d{8}$/;
const orderNumberRegex = /^ORD-\d{4}-\d{5}$/;

// Shipping address schema (used in checkout)
export const shippingAddressSchema = z.object({
    name: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name is too long"),
    phone: z.string().regex(bdPhoneRegex, "Invalid Bangladesh phone number"),
    street: z
        .string()
        .min(5, "Street address must be at least 5 characters")
        .max(200, "Address is too long"),
    city: z
        .string()
        .min(2, "City must be at least 2 characters")
        .max(50, "City name is too long"),
    area: z
        .string()
        .min(2, "Area must be at least 2 characters")
        .max(100, "Area name is too long"),
    postalCode: z
        .string()
        .min(4, "Postal code must be at least 4 characters")
        .max(10, "Postal code is too long"),
});

// Create order schema (Guest — no auth required)
export const createOrderSchema = z.object({
    items: z
        .array(
            z.object({
                variantId: z.string().min(1, "Variant ID is required"),
                quantity: z
                    .number()
                    .int("Quantity must be a whole number")
                    .positive("Quantity must be positive")
                    .max(10, "Maximum 10 items per variant"),
            })
        )
        .min(1, "At least one item is required"),
    shippingAddress: shippingAddressSchema,
    guestEmail: z.string().email("Invalid email").max(150, "Email is too long").optional(),
    paymentMethod: z.enum(["COD", "BKASH", "NAGAD", "SSLCOMMERZ"]),
    couponCode: z.string().max(50, "Coupon code is too long").optional(),
    note: z.string().max(1000, "Note is too long").optional(),
});

// Track order schema (Guest — no auth required)
export const trackOrderSchema = z.object({
    orderNumber: z
        .string()
        .regex(orderNumberRegex, "Invalid order number format (e.g., ORD-2026-00001)"),
    phone: z.string().regex(bdPhoneRegex, "Invalid Bangladesh phone number"),
});

// Admin: Update order status
export const updateOrderStatusSchema = z.object({
    orderId: z.string().min(1, "Order ID is required"),
    status: z.enum([
        "PENDING",
        "CONFIRMED",
        "PROCESSING",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED",
        "RETURNED",
        "REFUNDED",
    ]),
    note: z.string().max(500, "Note is too long").optional(),
    trackingNumber: z.string().max(150, "Tracking number is too long").optional(),
});

// Type exports
export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type TrackOrderInput = z.infer<typeof trackOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
