import { NextResponse } from "next/server";
import { executePayment as executeBkash } from "@/lib/payment/bkash";
import { verifyNagadPayment } from "@/lib/payment/nagad";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const gateway = url.searchParams.get("gateway");

    // In a real scenario, this endpoint receives data from bKash/Nagad server
    const data = await request.json();

    if (gateway === "bkash") {
      const paymentID = data.paymentID;
      const orderId = data.orderId; // Passed via callback

      if (!paymentID || !orderId) {
        return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
      }

      const order = await prisma.order.findUnique({
        where: { orderNumber: orderId },
        select: { id: true, paymentStatus: true, total: true },
      });

      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      // Idempotency check
      if (order.paymentStatus === "PAID") {
        return NextResponse.json({ message: "Payment already processed", idempotency: true });
      }

      const result = await executeBkash(paymentID);

      if (result.success) {
        await prisma.$transaction(async (tx) => {
          await tx.order.update({
            where: { id: order.id },
            data: { paymentStatus: "PAID", status: "PROCESSING" },
          });

          await tx.payment.updateMany({
            where: { orderId: order.id },
            data: {
              status: "PAID",
              transactionId: result.trxID || paymentID,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              gatewayResponse: result as any,
            },
          });

          await tx.orderTimeline.create({
            data: {
              orderId: order.id,
              status: "PROCESSING",
              note: `Payment confirmed via bKash (TrxID: ${result.trxID})`,
              createdBy: "WEBHOOK",
            },
          });
        });

        return NextResponse.json({ message: "Payment Successful", trxID: result.trxID });
      } else {
        await prisma.payment.updateMany({
          where: { orderId: order.id },
          data: { status: "FAILED" },
        });
        return NextResponse.json({ error: "Payment failed" }, { status: 400 });
      }
    }

    if (gateway === "nagad") {
      const paymentRefId = data.paymentRefId;
      const orderId = data.orderId;

      if (!paymentRefId || !orderId) {
        return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
      }

      const order = await prisma.order.findUnique({
        where: { orderNumber: orderId },
        select: { id: true, paymentStatus: true, total: true },
      });

      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      // Idempotency check
      if (order.paymentStatus === "PAID") {
        return NextResponse.json({ message: "Payment already processed", idempotency: true });
      }

      const result = await verifyNagadPayment(paymentRefId);

      if (result.success) {
        await prisma.$transaction(async (tx) => {
          await tx.order.update({
            where: { id: order.id },
            data: { paymentStatus: "PAID", status: "PROCESSING" },
          });

          await tx.payment.updateMany({
            where: { orderId: order.id },
            data: {
              status: "PAID",
              transactionId: result.trxId || paymentRefId,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              gatewayResponse: result as any,
            },
          });

          await tx.orderTimeline.create({
            data: {
              orderId: order.id,
              status: "PROCESSING",
              note: `Payment confirmed via Nagad (TrxID: ${result.trxId})`,
              createdBy: "WEBHOOK",
            },
          });
        });

        return NextResponse.json({ message: "Payment Successful", trxID: result.trxId });
      } else {
        await prisma.payment.updateMany({
          where: { orderId: order.id },
          data: { status: "FAILED" },
        });
        return NextResponse.json({ error: "Payment failed" }, { status: 400 });
      }
    }

    return NextResponse.json({ error: "Unknown gateway" }, { status: 400 });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
