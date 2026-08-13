/**
 * Sitara — Invoice PDF API Route
 * GET /api/invoice/[orderId] — Generate and return PDF invoice
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateInvoice } from "@/lib/invoice";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orderId } = await params;

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            variant: {
              include: { product: { select: { name: true } } },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Auth: user can only access their own orders, admin can access all
    const role = (session.user as { role?: string }).role;
    const isAdmin = ["STAFF", "MANAGER", "ADMIN", "SUPER_ADMIN"].includes(role || "");

    if (!isAdmin && order.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const address = (order.shippingAddress as {
      name?: string;
      phone?: string;
      street?: string;
      area?: string;
      city?: string;
      postalCode?: string;
      email?: string;
    }) || {};

    const invoiceData = {
      orderNumber: order.orderNumber,
      date: new Date(order.createdAt).toLocaleDateString("en-BD", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      customerName: order.guestName || address.name || "Customer",
      customerPhone: order.guestPhone || address.phone || "",
      customerEmail: order.guestEmail || address.email || undefined,
      address: {
        street: address.street || "",
        area: address.area || "",
        city: address.city || "",
        postalCode: address.postalCode || "",
      },
      items: order.items.map((item) => ({
        name: item.variant?.product?.name || "Deleted Product",
        size: item.variant?.size || undefined,
        color: item.variant?.color || undefined,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
      })),
      subtotal: Number(order.subtotal),
      shippingCharge: Number(order.shippingCharge),
      discount: Number(order.discount),
      total: Number(order.total),
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
    };

    const pdfDataUri = generateInvoice(invoiceData);

    // Convert data URI to buffer
    const base64Data = pdfDataUri.split(",")[1] || "";
    const pdfBuffer = Buffer.from(base64Data, "base64");

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="invoice-${order.orderNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error("[API/INVOICE] Error:", error);
    return NextResponse.json({ error: "Failed to generate invoice" }, { status: 500 });
  }
}
