import { TableSkeleton } from "@/components/admin/table-skeleton";

export default function OrdersLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500">Loading orders data...</p>
        </div>
      </div>
      <TableSkeleton />
    </div>
  );
}
