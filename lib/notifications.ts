import { prisma } from "@/lib/db";

export type NotificationType = "NEW_ORDER" | "LOW_STOCK" | "NEW_REVIEW" | "SYSTEM";

export async function notify({
  type,
  title,
  message,
  data,
}: {
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}) {
  try {
    await prisma.notification.create({
      data: {
        type,
        title,
        message,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: data ? (data as any) : undefined,
      },
    });
  } catch (error) {
    console.error("[NOTIFY] Failed to create notification:", error);
  }
}
