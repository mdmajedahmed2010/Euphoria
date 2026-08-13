/**
 * Euphoria — Product Status Badge Component
 */

export function ProductStatusBadge({ status }: { status: string }) {
  const statusColors: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-700",
    DRAFT: "bg-gray-100 text-gray-700",
    OUT_OF_STOCK: "bg-red-100 text-red-700",
    ARCHIVED: "bg-yellow-100 text-yellow-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
        statusColors[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
