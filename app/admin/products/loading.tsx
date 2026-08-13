import { TableSkeleton } from "@/components/admin/table-skeleton";

export default function ProductsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500">Loading products data...</p>
        </div>
      </div>
      <TableSkeleton />
    </div>
  );
}
