import { getCampaigns } from "@/actions/campaign.actions";
import { CampaignManager } from "@/components/admin/campaign-manager";
import { Timer } from "lucide-react";
import { prisma } from "@/lib/db";

export const metadata = {
  title: "Flash Sales & Campaigns | Sitara Admin",
  description: "Manage flash sales and promotional campaigns",
};

export default async function CampaignsPage() {
  const result = await getCampaigns();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const campaigns = (result.campaigns || []) as any[];

  const products = await prisma.product.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100">
            <Timer className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Flash Sales & Campaigns</h1>
            <p className="mt-0.5 text-sm text-gray-500">Create and manage limited-time offers</p>
          </div>
        </div>
      </div>

      <CampaignManager initialCampaigns={campaigns} products={products} />
    </div>
  );
}
