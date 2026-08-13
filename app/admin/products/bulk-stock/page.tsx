/**
 * Sitara — Bulk Stock Management Page
 * SOP §১০ — Administrative catalog controls
 */

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import BulkStockForm from "@/components/admin/bulk-stock-form";
import { SlidersHorizontal } from "lucide-react";
import Link from "next/link";

export default async function AdminBulkStockPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = (session.user as { role?: string }).role;
  const allowedRoles = ["STAFF", "MANAGER", "ADMIN", "SUPER_ADMIN"];
  if (!allowedRoles.includes(role || "")) {
    redirect("/admin");
  }

  // Fetch active products with active variants and category info
  const products = await prisma.product.findMany({
    where: { deletedAt: null },
    include: {
      variants: {
        where: { isActive: true },
        orderBy: { sku: "asc" },
      },
      category: {
        select: { name: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Convert Decimal types from Prisma schema into standard numbers so Next.js can serialize it safely
  const serializedProducts = products.map((prod) => ({
    id: prod.id,
    name: prod.name,
    category: { name: prod.category?.name || "Uncategorized" },
    variants: prod.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      size: v.size,
      color: v.color,
      price: Number(v.price),
      stock: v.stock,
    })),
  }));

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl flex items-center gap-2">
            <SlidersHorizontal className="h-6 w-6 text-gray-800" />
            Bulk Stock Management Matrix
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Rapid catalog inventory restock matrix. Adjust, review, and save multiple stock
            quantities in one batch transaction.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 active:scale-[0.98]"
          >
            All Products
          </Link>
        </div>
      </div>

      {/* Interactive form */}
      <BulkStockForm products={serializedProducts} />
    </div>
  );
}
