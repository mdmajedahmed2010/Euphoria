"use client";

import { useState, useRef } from "react";
import { exportProductsCSV, importProductsCSV } from "@/actions/product.actions";
import { Download, Upload } from "lucide-react";

export function ProductExportImport() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    setIsExporting(true);
    const res = await exportProductsCSV();
    setIsExporting(false);

    if (res.success && res.csvData) {
      const blob = new Blob([res.csvData], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `products_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert(res.error || "Failed to export products");
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const csvData = event.target?.result as string;
      if (csvData) {
        const res = await importProductsCSV(csvData);
        setIsImporting(false);
        if (res.success) {
          alert(`Successfully updated ${res.updatedCount} product variants.`);
          window.location.reload();
        } else {
          alert(res.error || "Failed to import products");
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleExport}
        disabled={isExporting}
        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:opacity-50"
      >
        <Download className="h-4 w-4" />
        {isExporting ? "Exporting..." : "Export CSV"}
      </button>

      <input
        type="file"
        accept=".csv"
        ref={fileInputRef}
        onChange={handleImport}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isImporting}
        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:opacity-50"
      >
        <Upload className="h-4 w-4" />
        {isImporting ? "Importing..." : "Import CSV"}
      </button>
    </div>
  );
}
