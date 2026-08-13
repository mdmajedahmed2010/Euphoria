import { TableSkeleton } from "@/components/admin/table-skeleton";

export default function CampaignsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Flash Sales & Campaigns</h1>
          <p className="text-sm text-gray-500">Loading campaigns data...</p>
        </div>
      </div>
      <TableSkeleton />
    </div>
  );
}
