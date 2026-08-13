import { getAdminCollections } from "@/actions/collection.actions";
import { CollectionsManager } from "@/components/admin/collections-manager";
import { Sparkles } from "lucide-react";
import { prisma } from "@/lib/db";

export default async function AdminCollectionsPage() {
  const [collectionsResult, products] = await Promise.all([
    getAdminCollections(),
    prisma.product.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const collections = (collectionsResult.collections || []) as any[];

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50">
          <Sparkles className="h-5 w-5 text-purple-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Collections</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Curated product groups for marketing and homepage display
          </p>
        </div>
      </div>

      <CollectionsManager initialCollections={collections} allProducts={products} />
    </div>
  );
}
