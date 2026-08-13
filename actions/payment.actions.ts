"use server";

/**
 * BIBAZ — Payment Server Actions
 * SOP §৪E, §৬D — Payment System
 *
 * Phase 1: COD only
 * Phase 2: bKash + Nagad (future)
 * Phase 3: SSLCommerz (future)
 */

import { prisma, serializeDecimals } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// ═══════════════════════════════════════════
// COD PAYMENT (Phase 1)
// ═══════════════════════════════════════════

/**
 * Initiate COD payment — creates payment record with UNPAID status
 * Payment collected on delivery, admin marks as PAID
 */
export async function initiateCODPayment(orderId: string) {
  try {
    // Generate unique transaction ID
    const transactionId = `COD-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { total: true, paymentMethod: true },
    });

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    if (order.paymentMethod !== "COD") {
      return { success: false, error: "Order is not COD" };
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        orderId,
        transactionId,
        method: "COD",
        amount: order.total,
        status: "UNPAID",
      },
    });

    return { success: true, payment: serializeDecimals(payment) };
  } catch (error) {
    console.error("[PAYMENT] initiateCODPayment error:", error);
    return { success: false, error: "Failed to initiate payment" };
  }
}

/**
 * Mark COD payment as paid (Admin — on delivery confirmation)
 */
export async function markCODPaid(orderId: string) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Not authenticated" };

  const role = (session.user as { role?: string }).role;
  if (!["STAFF", "MANAGER", "ADMIN", "SUPER_ADMIN"].includes(role || "")) {
    return { success: false, error: "Insufficient permissions" };
  }

  try {
    // Update payment status
    await prisma.payment.updateMany({
      where: { orderId, method: "COD" },
      data: { status: "PAID" },
    });

    // Update order payment status
    await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: "PAID" },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        adminId: session.user.id as string,
        action: "MARK_COD_PAID",
        entity: "Payment",
        entityId: orderId,
        newValue: { paymentStatus: "PAID" },
      },
    });

    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error) {
    console.error("[PAYMENT] markCODPaid error:", error);
    return { success: false, error: "Failed to mark payment" };
  }
}

/**
 * Process refund (Admin only)
 */
export async function processRefund(orderId: string, amount: number, reason: string) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Not authenticated" };

  const role = (session.user as { role?: string }).role;
  if (!["ADMIN", "SUPER_ADMIN"].includes(role || "")) {
    return { success: false, error: "Only admins can process refunds" };
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { total: true, paymentStatus: true },
    });

    if (!order) return { success: false, error: "Order not found" };

    if (amount > Number(order.total)) {
      return { success: false, error: "Refund amount exceeds order total" };
    }

    // Create refund payment record
    const transactionId = `REFUND-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    await prisma.payment.create({
      data: {
        orderId,
        transactionId,
        method: "COD",
        amount: amount,
        status: "REFUNDED",
      },
    });

    // Update order status
    const newPaymentStatus = amount >= Number(order.total) ? "REFUNDED" : "PARTIALLY_REFUNDED";

    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: newPaymentStatus,
        status: "REFUNDED",
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        adminId: session.user.id as string,
        action: "PROCESS_REFUND",
        entity: "Order",
        entityId: orderId,
        newValue: { amount, reason, paymentStatus: newPaymentStatus },
      },
    });

    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error) {
    console.error("[PAYMENT] processRefund error:", error);
    return { success: false, error: "Failed to process refund" };
  }
}
