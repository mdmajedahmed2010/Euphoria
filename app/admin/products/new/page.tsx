/**
 * Sitara — Admin Create Product Page
 */

import { getCategories } from "@/actions/product.actions";
import { getAdminCollections } from "@/actions/collection.actions";
import { CreateProductForm } from "@/components/admin/create-product-form";

export default async function AdminNewProductPage() {
  const [categoriesResult, collectionsResult] = await Promise.all([
    getCategories(),
    getAdminCollections(),
  ]);

  const categories = categoriesResult.categories || [];
  const collections = collectionsResult.collections || [];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create Product</h1>
        <p className="text-sm text-gray-500">Add a new product to your catalog</p>
      </div>

      <CreateProductForm categories={categories} collections={collections} />
    </div>
  );
}
