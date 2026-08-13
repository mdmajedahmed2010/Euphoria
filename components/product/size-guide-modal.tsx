/**
 * Euphoria — Size Guide Modal
 * Shows size chart for products
 * SOP §২ — Frontend Plan: "Size Guide: Modal/drawer with size chart"
 */

"use client";

import { useState } from "react";
import { Ruler, X } from "lucide-react";

const sizeChart = [
  { size: "XS", bust: "32", waist: "26", hip: "34", length: "38" },
  { size: "S", bust: "34", waist: "28", hip: "36", length: "39" },
  { size: "M", bust: "36", waist: "30", hip: "38", length: "40" },
  { size: "L", bust: "38", waist: "32", hip: "40", length: "41" },
  { size: "XL", bust: "40", waist: "34", hip: "42", length: "42" },
  { size: "XXL", bust: "42", waist: "36", hip: "44", length: "43" },
];

export function SizeGuideModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
      >
        <Ruler className="h-3 w-3" />
        Size Guide
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 animate-[fadeIn_0.2s_ease-out]"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal */}
          <div className="relative bg-background rounded-xl border border-border shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto animate-[fadeInUp_0.3s_ease-out] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Size Guide</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close size guide"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              All measurements are in inches. For the best fit, measure yourself and compare with
              the chart below.
            </p>

            {/* Size Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 font-medium">Size</th>
                    <th className="text-center py-2 px-2 font-medium">Bust</th>
                    <th className="text-center py-2 px-2 font-medium">Waist</th>
                    <th className="text-center py-2 px-2 font-medium">Hip</th>
                    <th className="text-center py-2 pl-2 font-medium">Length</th>
                  </tr>
                </thead>
                <tbody>
                  {sizeChart.map((row) => (
                    <tr key={row.size} className="border-b border-border last:border-0">
                      <td className="py-2.5 pr-4 font-medium">{row.size}</td>
                      <td className="py-2.5 px-2 text-center text-muted-foreground">
                        {row.bust}&quot;
                      </td>
                      <td className="py-2.5 px-2 text-center text-muted-foreground">
                        {row.waist}&quot;
                      </td>
                      <td className="py-2.5 px-2 text-center text-muted-foreground">
                        {row.hip}&quot;
                      </td>
                      <td className="py-2.5 pl-2 text-center text-muted-foreground">
                        {row.length}&quot;
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              Note: Measurements may vary slightly depending on the style. When in doubt, size up
              for a more comfortable fit.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
