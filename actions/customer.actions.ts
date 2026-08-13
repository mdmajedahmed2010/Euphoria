"use server";

/**
 * BIBAZ — Customer Management Actions (Admin)
 * SOP §৬F — Admin Customer Management
 */

import { prisma, serializeDecimals } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/**
 * Get all customers with order stats (Admin)
 */
export async function getCustomers(options?: {
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  const session = await auth();
  if (!session?.user) return { success: false, customers: [] };

  const role = (session.user as { role?: string }).role;
  if (!["MANAGER", "ADMIN", "SUPER_ADMIN"].includes(role || "")) {
    return { success: false, customers: [], error: "Insufficient permissions" };
  }

  try {
    const { search, page = 1, pageSize = 20 } = options || {};

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { role: "CUSTOMER" };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    const skip = (page - 1) * pageSize;

    const [customers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          createdAt: true,
          deletedAt: true,
          _count: { select: { orders: true } },
          orders: {
            select: { total: true },
            where: { status: { in: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"] } },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const formattedCustomers = customers.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      createdAt: c.createdAt,
      isBanned: !!c.deletedAt,
      orderCount: c._count.orders,
      totalSpent: c.orders.reduce((sum, o) => sum + Number(o.total), 0),
    }));

    return {
      success: true,
      customers: formattedCustomers,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  } catch (error) {
    console.error("[CUSTOMER] getCustomers error:", error);
    return { success: false, customers: [], error: "Failed to fetch customers" };
  }
}

/**
 * Ban a customer (soft delete — sets deletedAt)
 */
export async function banCustomer(userId: string, reason?: string) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Not authenticated" };

  const role = (session.user as { role?: string }).role;
  if (!["ADMIN", "SUPER_ADMIN"].includes(role || "")) {
    return { success: false, error: "Only admins can ban customers" };
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });

    await prisma.auditLog.create({
      data: {
        adminId: session.user.id as string,
        action: "BAN_CUSTOMER",
        entity: "User",
        entityId: userId,
        newValue: { reason: reason || "Banned by admin" },
      },
    });

    revalidatePath("/admin/customers");
    return { success: true };
  } catch (error) {
    console.error("[CUSTOMER] banCustomer error:", error);
    return { success: false, error: "Failed to ban customer" };
  }
}

/**
 * Unban a customer (removes deletedAt)
 */
export async function unbanCustomer(userId: string) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Not authenticated" };

  const role = (session.user as { role?: string }).role;
  if (!["ADMIN", "SUPER_ADMIN"].includes(role || "")) {
    return { success: false, error: "Only admins can unban customers" };
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { deletedAt: null },
    });

    await prisma.auditLog.create({
      data: {
        adminId: session.user.id as string,
        action: "UNBAN_CUSTOMER",
        entity: "User",
        entityId: userId,
      },
    });

    revalidatePath("/admin/customers");
    return { success: true };
  } catch (error) {
    console.error("[CUSTOMER] unbanCustomer error:", error);
    return { success: false, error: "Failed to unban customer" };
  }
}

/**
 * Get customer detail with order history (Admin)
 */
export async function getCustomerDetail(userId: string) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Not authenticated" };

  const role = (session.user as { role?: string }).role;
  if (!["MANAGER", "ADMIN", "SUPER_ADMIN"].includes(role || "")) {
    return { success: false, error: "Insufficient permissions" };
  }

  try {
    if (userId.startsWith("guest-")) {
      const phone = decodeURIComponent(userId.replace("guest-", ""));
      const guestOrders = await prisma.order.findMany({
        where: { guestPhone: phone, deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          orderNumber: true,
          status: true,
          total: true,
          createdAt: true,
          guestName: true,
          guestEmail: true,
          shippingAddress: true,
        },
      });

      const firstOrder = guestOrders[0];
      if (!firstOrder) {
        return { success: false, error: "Guest customer not found" };
      }
      return {
        success: true,
        customer: serializeDecimals({
          id: userId,
          name: firstOrder.guestName || "Guest Buyer",
          email: firstOrder.guestEmail || "Guest Checkout",
          phone: phone,
          createdAt: (guestOrders[guestOrders.length - 1] || firstOrder).createdAt,
          deletedAt: null,
          addresses: [firstOrder.shippingAddress],
          orders: guestOrders,
          _count: { orders: guestOrders.length, reviews: 0, wishlists: 0 },
          isGuest: true,
        }),
      };
    }

    const customer = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        deletedAt: true,
        addresses: true,
        orders: {
          orderBy: { createdAt: "desc" },
          take: 20,
          select: {
            id: true,
            orderNumber: true,
            status: true,
            total: true,
            createdAt: true,
          },
        },
        _count: { select: { orders: true, reviews: true, wishlists: true } },
      },
    });

    if (!customer) {
      return { success: false, error: "Customer not found" };
    }

    return { success: true, customer: serializeDecimals({ ...customer, isGuest: false }) };
  } catch (error) {
    console.error("[CUSTOMER] getCustomerDetail error:", error);
    return { success: false, error: "Failed to fetch customer" };
  }
}

/**
 * Hard delete a customer (Admin)
 */
export async function deleteCustomer(userId: string) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Not authenticated" };

  const role = (session.user as { role?: string }).role;
  if (!["ADMIN", "SUPER_ADMIN"].includes(role || "")) {
    return { success: false, error: "Only admins can delete customers" };
  }

  try {
    await prisma.user.delete({
      where: { id: userId },
    });

    await prisma.auditLog.create({
      data: {
        adminId: session.user.id as string,
        action: "DELETE_CUSTOMER",
        entity: "User",
        entityId: userId,
      },
    });

    revalidatePath("/admin/customers");
    return { success: true };
  } catch (error) {
    console.error("[CUSTOMER] deleteCustomer error:", error);
    return { success: false, error: "Failed to delete customer" };
  }
}
