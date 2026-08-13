"use client";

import { Search, AlertTriangle, CheckCircle } from "lucide-react";

export function SeoAnalyzer({
  title,
  desc,
  name,
  description,
}: {
  title: string;
  desc: string;
  name: string;
  description: string;
}) {
  let s = 100;
  const newIssues: { type: "error" | "warning" | "success"; msg: string }[] = [];

  const effectiveTitle = title || name;
  const effectiveDesc = desc || description;

  // Title checks
  if (!effectiveTitle || effectiveTitle.length < 10) {
    s -= 20;
    newIssues.push({ type: "error", msg: "Title is too short. Aim for 30-60 characters." });
  } else if (effectiveTitle.length > 60) {
    s -= 10;
    newIssues.push({
      type: "warning",
      msg: "Title is too long. Keep it under 60 characters to avoid truncation in Google.",
    });
  } else {
    newIssues.push({ type: "success", msg: "Title length is optimal." });
  }

  // Description checks
  if (!effectiveDesc || effectiveDesc.length < 50) {
    s -= 30;
    newIssues.push({ type: "error", msg: "Description is too short. Aim for 120-160 characters." });
  } else if (effectiveDesc.length > 160) {
    s -= 15;
    newIssues.push({
      type: "warning",
      msg: "Description is too long. Keep it under 160 characters.",
    });
  } else {
    newIssues.push({ type: "success", msg: "Description length is optimal." });
  }

  // Keyword Checks (crude but effective)
  if (
    effectiveTitle &&
    effectiveDesc &&
    !effectiveDesc.toLowerCase().includes(effectiveTitle.toLowerCase().split(" ")[0] || "")
  ) {
    s -= 10;
    newIssues.push({
      type: "warning",
      msg: "First word of the title is not found in the description. Try including main keywords in both.",
    });
  }

  const score = Math.max(0, s);
  const issues = newIssues;

  let color = "text-emerald-500 bg-emerald-50 border-emerald-200";
  if (score < 50) color = "text-red-500 bg-red-50 border-red-200";
  else if (score < 80) color = "text-amber-500 bg-amber-50 border-amber-200";

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <Search className="w-4 h-4 text-gray-400" />
          SEO Analyzer
        </h3>
        <div className={`px-3 py-1 rounded-full border font-bold text-sm ${color}`}>
          Score: {score}/100
        </div>
      </div>

      <div className="space-y-3">
        {issues.map((issue, i) => (
          <div
            key={i}
            className={`flex items-start gap-2 p-3 rounded-lg border ${
              issue.type === "error"
                ? "bg-red-50 border-red-100 text-red-800"
                : issue.type === "warning"
                  ? "bg-amber-50 border-amber-100 text-amber-800"
                  : "bg-emerald-50 border-emerald-100 text-emerald-800"
            }`}
          >
            {issue.type === "success" ? (
              <CheckCircle className="w-4 h-4 mt-0.5 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 mt-0.5" />
            )}
            <p className="text-xs font-medium">{issue.msg}</p>
          </div>
        ))}
      </div>

      {/* Google Search Preview */}
      <div className="mt-6 p-4 rounded-lg bg-[#f8f9fa] border border-gray-200">
        <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wider">
          Google Search Preview
        </p>
        <div className="max-w-[600px]">
          <p className="text-[14px] text-[#202124] leading-[1.3] truncate mb-[2px]">
            Euphoria.com › products
          </p>
          <h4 className="text-[20px] text-[#1a0dab] leading-[1.3] truncate hover:underline cursor-pointer mb-1">
            {title || name || "Product Title"}
          </h4>
          <p className="text-[14px] text-[#4d5156] leading-[1.58] line-clamp-2">
            {desc ||
              description ||
              "Product description goes here. Make sure it's catchy and includes your main keywords to attract more clicks."}
          </p>
        </div>
      </div>
    </div>
  );
}
