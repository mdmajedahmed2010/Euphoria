"use client";

import { Download } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ReportExportButton({ data }: { data: any }) {
  const handleExport = () => {
    // Basic CSV generation for report data
    const headers = ["Metric", "Value"];
    const rows = [
      ["Total Revenue", data.totalRevenue],
      ["Total Orders", data.totalOrders],
      ["Average Order Value", data.avgOrderValue],
      ["Total Customers", data.totalCustomers],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...data.ordersByStatus.map((s: any) => [`Status: ${s.status}`, s._count]),
    ];

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `report-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleExport}
      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 active:scale-95"
    >
      <Download className="h-3.5 w-3.5" />
      Export CSV
    </button>
  );
}
