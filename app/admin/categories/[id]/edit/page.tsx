/**
 * Sitara — Edit Category Page
 * SOP §৬A — Structural Category Edit Container
 */

import { prisma, serializeDecimals } from "@/lib/db";
import { EditCategoryForm } from "@/components/admin/edit-category-form";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditCategoryPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = (session.user as { role?: string }).role;
  if (!["ADMIN", "SUPER_ADMIN"].includes(role || "")) {
    redirect("/admin");
  }

  const { id } = await params;

  // Fetch target category and all categories in parallel
  const [categoryRaw, allCategoriesRaw] = await Promise.all([
    prisma.category.findUnique({
      where: { id },
    }),
    prisma.category.findMany({
      select: {
        id: true,
        name: true,
        parentId: true,
      },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  if (!categoryRaw) {
    notFound();
  }

  const category = serializeDecimals(categoryRaw);
  const allCategories = serializeDecimals(allCategoriesRaw) || [];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Category</h1>
        <p className="text-sm text-gray-500">
          Modify details, status, or structural hierarchy for &ldquo;{category.name}&rdquo;
        </p>
      </div>

      <EditCategoryForm category={category} categories={allCategories} />
    </div>
  );
}
