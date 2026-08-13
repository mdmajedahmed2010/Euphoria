"use server";

/**
 * BIBAZ — Global Admin Search Action
 * Searches across orders, products, and customers with a single query.
 */

import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/permissions";

export interface SearchResults {
  orders: {
    id: string;
    orderNumber: string;
    guestName: string | null;
    guestPhone: string;
    total: number;
    status: string;
    createdAt: Date;
  }[];
  products: {
    id: string;
    name: string;
    slug: string;
    status: string;
    basePrice: number;
  }[];
  customers: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  }[];
}

export async function globalAdminSearch(query: string): Promise<SearchResults> {
  try {
    await requirePermission("view_orders");

    if (!query || query.length < 2) {
      return { orders: [], products: [], customers: [] };
    }

    const [orders, products, customers] = await Promise.all([
      prisma.order.findMany({
        where: {
          deletedAt: null,
          OR: [
            { orderNumber: { contains: query } },
            { guestPhone: { contains: query } },
            { guestName: { contains: query } },
            { guestEmail: { contains: query } },
          ],
        },
        select: {
          id: true,
          orderNumber: true,
          guestName: true,
          guestPhone: true,
          total: true,
          status: true,
          createdAt: true,
        },
        take: 5,
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.findMany({
        where: {
          deletedAt: null,
          OR: [
            { name: { contains: query } },
            { slug: { contains: query } },
          ],
        },
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
          basePrice: true,
        },
        take: 5,
      }),
      prisma.user.findMany({
        where: {
          deletedAt: null,
          role: "CUSTOMER",
          OR: [
            { name: { contains: query } },
            { email: { contains: query } },
            { phone: { contains: query } },
          ],
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
        take: 5,
      }),
    ]);

    return {
      orders: orders.map((o) => ({
        ...o,
        total: Number(o.total),
      })),
      products: products.map((p) => ({
        ...p,
        basePrice: Number(p.basePrice),
      })),
      customers,
    };
  } catch (error) {
    console.error("[SEARCH] Global search failed:", error);
    return { orders: [], products: [], customers: [] };
  }
}
