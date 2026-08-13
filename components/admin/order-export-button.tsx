"use client";

import { exportOrdersToCSV } from "@/actions/order.actions";
import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function OrderExportButton() {
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const res = await exportOrdersToCSV();
      if (res.success && res.csv) {
        const blob = new Blob([res.csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute(
          "download",
          `Euphoria_orders_export_${new Date().toISOString().split("T")[0]}.csv`
        );
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Excel/CSV export completed successfully!");
      } else {
        toast.error(res.error || "Failed to export orders");
      }
    } catch (err) {
      toast.error("An error occurred during export");
      console.error(err);
    } finally {
      setExporting(false);
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 active:scale-95 disabled:opacity-50 cursor-pointer"
    >
      {exporting ? (
        <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
      ) : (
        <Download className="h-4 w-4 text-gray-500" />
      )}
      {exporting ? "Exporting..." : "Export Excel/CSV"}
    </button>
  );
}
