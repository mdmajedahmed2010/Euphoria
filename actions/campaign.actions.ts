"use server";

/**
 * BIBAZ — Campaign Server Actions
 * Manage Flash Sales & Promotional Campaigns
 */

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getCampaigns() {
  try {
    const campaigns = await prisma.campaign.findMany({
      orderBy: { createdAt: "desc" },
    });

    const serializedCampaigns = campaigns.map((campaign) => ({
      ...campaign,
      discountValue: Number(campaign.discountValue),
    }));

    return { success: true, campaigns: serializedCampaigns };
  } catch (error) {
    console.error("[CAMPAIGN] getCampaigns error:", error);
    return { success: false, error: "Failed to fetch campaigns" };
  }
}

export async function getActiveCampaign() {
  try {
    const now = new Date();
    const campaign = await prisma.campaign.findFirst({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
    });

    if (!campaign) return { success: true, campaign: null };

    return {
      success: true,
      campaign: {
        ...campaign,
        discountValue: Number(campaign.discountValue),
      },
    };
  } catch (error) {
    console.error("[CAMPAIGN] getActiveCampaign error:", error);
    return { success: false, error: "Failed to fetch active campaign" };
  }
}

export interface CampaignInput {
  name: string;
  description?: string;
  startDate: string | Date;
  endDate: string | Date;
  discountType: string;
  discountValue: number;
  isActive: boolean;
  productIds?: string[];
}

export async function createCampaign(data: CampaignInput) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!["MANAGER", "ADMIN", "SUPER_ADMIN"].includes(role || "")) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.campaign.create({
      data: {
        name: data.name,
        description: data.description,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        discountType: data.discountType,
        discountValue: data.discountValue,
        isActive: data.isActive,
        productIds: data.productIds || [],
      },
    });

    revalidatePath("/admin/campaigns");
    return { success: true };
  } catch (error) {
    console.error("[CAMPAIGN] createCampaign error:", error);
    return { success: false, error: "Failed to create campaign" };
  }
}

export async function updateCampaign(id: string, data: Partial<CampaignInput>) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!["MANAGER", "ADMIN", "SUPER_ADMIN"].includes(role || "")) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.campaign.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        discountType: data.discountType,
        discountValue: data.discountValue,
        isActive: data.isActive,
        productIds: data.productIds,
      },
    });

    revalidatePath("/admin/campaigns");
    return { success: true };
  } catch (error) {
    console.error("[CAMPAIGN] updateCampaign error:", error);
    return { success: false, error: "Failed to update campaign" };
  }
}

export async function deleteCampaign(id: string) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!["MANAGER", "ADMIN", "SUPER_ADMIN"].includes(role || "")) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.campaign.delete({
      where: { id },
    });

    revalidatePath("/admin/campaigns");
    return { success: true };
  } catch (error) {
    console.error("[CAMPAIGN] deleteCampaign error:", error);
    return { success: false, error: "Failed to delete campaign" };
  }
}
