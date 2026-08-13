import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendEmail, abandonedCartEmail } from "@/lib/email";

// Vercel Cron or External Cron triggers this
export async function GET(request: Request) {
  try {
    // 1. Authenticate the cron job strictly
    const expectedSecret = process.env.CRON_SECRET || "Sitara_cron_secret_2026";
    const authHeader = request.headers.get("authorization");
    const querySecret = new URL(request.url).searchParams.get("secret");
    if (authHeader !== `Bearer ${expectedSecret}` && querySecret !== expectedSecret) {
      return NextResponse.json({ error: "Unauthorized cron request" }, { status: 401 });
    }

    // 2. Find carts abandoned for more than 2 hours and not yet emailed
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const cartsToRecover = await prisma.abandonedCart.findMany({
      where: {
        status: "pending",
        emailSentAt: null,
        createdAt: {
          lte: twoHoursAgo,
        },
      },
      include: {
        user: true,
      },
      take: 50, // Process in batches
    });

    if (cartsToRecover.length === 0) {
      return NextResponse.json({ message: "No abandoned carts to process." });
    }

    let sentCount = 0;

    // 3. Send emails
    for (const cart of cartsToRecover) {
      const email = cart.guestEmail || cart.user?.email;
      const name = cart.user?.name || "Customer";

      if (email) {
        // Prepare recovery URL
        const recoveryUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://majedahmed.space"}/cart?recover=${cart.recoveryToken}`;

        const emailContent = abandonedCartEmail({
          customerName: name,
          recoveryUrl,
        });

        const res = await sendEmail({
          ...emailContent,
          to: email,
        });

        if (res.success) {
          // 4. Update the cart record
          await prisma.abandonedCart.update({
            where: { id: cart.id },
            data: {
              emailSentAt: new Date(),
              status: "notified", // Update status to reflect email was sent
            },
          });
          sentCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${cartsToRecover.length} carts. Sent ${sentCount} emails.`,
    });
  } catch (error) {
    console.error("[CRON_ABANDONED_CART]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
