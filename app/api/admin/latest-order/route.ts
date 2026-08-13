/**
 * Sitara — Latest Order API Route
 * Lightweight endpoint for polling new orders (Sales Celebration feature).
 * Returns latest confirmed order to detect new sales.
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string })?.role;
    if (role !== "ADMIN" && role !== "SUPER_ADMIN" && role !== "STAFF") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const latestOrder = await prisma.order.findFirst({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderNumber: true,
        total: true,
        createdAt: true,
        status: true,
      },
    });

    if (!latestOrder) {
      return NextResponse.json({ order: null });
    }

    return NextResponse.json({
      order: {
        id: latestOrder.id,
        orderNumber: latestOrder.orderNumber,
        total: Number(latestOrder.total),
        createdAt: latestOrder.createdAt.toISOString(),
        status: latestOrder.status,
      },
    });
  } catch {
    return NextResponse.json({ order: null });
  }
}
