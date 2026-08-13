import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ExcelBulkEditor } from "@/components/admin/excel-bulk-editor";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function BulkEditorPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = (session.user as { role?: string }).role;
  if (!["MANAGER", "ADMIN", "SUPER_ADMIN"].includes(role || "")) {
    redirect("/admin/products");
  }

  // Fetch all active products with their variants
  const rawProducts = await prisma.product.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      name: true,
      basePrice: true,
      status: true,
      category: { select: { name: true } },
      variants: {
        where: { isActive: true },
        select: {
          id: true,
          sku: true,
          size: true,
          color: true,
          price: true,
          stock: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const products = rawProducts.map((p) => ({
    ...p,
    basePrice: Number(p.basePrice),
    variants: p.variants.map((v) => ({
      ...v,
      price: Number(v.price),
    })),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-5">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/products"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Excel-style Bulk Editor</h1>
            <p className="text-sm text-gray-500 mt-1">
              Rapidly update prices, stock, and SKUs across your entire catalog.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl text-sm">
        <strong>Pro Tip:</strong> You can edit directly in the table cells just like Excel. Once you
        are done making all your changes, click the &quot;Save All Changes&quot; button.
      </div>

      <ExcelBulkEditor initialProducts={products} />
    </div>
  );
}
