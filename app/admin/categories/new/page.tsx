/**
 * Sitara — Create Category Page
 * SOP §৬A — Structural Category Creation Container
 */

import { prisma, serializeDecimals } from "@/lib/db";
import { CreateCategoryForm } from "@/components/admin/create-category-form";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminCreateCategoryPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = (session.user as { role?: string }).role;
  if (!["ADMIN", "SUPER_ADMIN"].includes(role || "")) {
    redirect("/admin");
  }

  // Fetch only top-level categories that can act as parent categories
  const categoriesRaw = await prisma.category.findMany({
    where: { parentId: null, isActive: true },
    select: {
      id: true,
      name: true,
    },
    orderBy: { sortOrder: "asc" },
  });

  const categories = serializeDecimals(categoriesRaw) || [];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create Category</h1>
        <p className="text-sm text-gray-500">
          Add a new classification or subcategory to structure your store catalog
        </p>
      </div>

      <CreateCategoryForm categories={categories} />
    </div>
  );
}
