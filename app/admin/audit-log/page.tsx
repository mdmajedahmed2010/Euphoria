/**
 * Sitara — Advanced Admin Audit Log Portal
 * SOP §৪F — Every administrative action logged & diffed
 */

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Shield, Search, Eye, Calendar, Layers, Terminal, ChevronDown } from "lucide-react";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ q?: string; action?: string }>;
}

export default async function AdminAuditLogPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = (session.user as { role?: string }).role;
  if (role !== "SUPER_ADMIN" && role !== "ADMIN") {
    redirect("/admin");
  }

  // Resolve search and action filters asynchronously (Next.js 15 compliance)
  const resolvedParams = await searchParams;
  const q = resolvedParams.q || "";
  const actionFilter = resolvedParams.action || "";

  // Fetch audit logs matching filters
  const logsRaw = await prisma.auditLog.findMany({
    where: {
      AND: [
        actionFilter ? { action: actionFilter } : {},
        q
          ? {
              OR: [
                { admin: { name: { contains: q } } },
                { admin: { email: { contains: q } } },
                { entity: { contains: q } },
                { entityId: { contains: q } },
              ],
            }
          : {},
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      admin: { select: { name: true, email: true } },
    },
  });

  const availableActions = ["CREATE", "UPDATE", "DELETE", "AUTHENTICATE", "SETTINGS"];

  return (
    <div className="space-y-7 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl flex items-center gap-2">
            <Shield className="h-6 w-6 text-gray-800" />
            Security & Activity Audit Logs
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Cryptographically solid accountability database of all manager and staff operations.
          </p>
        </div>
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 active:scale-[0.98]"
          >
            Dashboard
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-gray-200/85 bg-white p-4 shadow-sm space-y-4">
        <form method="GET" className="flex flex-col gap-3 md:flex-row md:items-center">
          {/* Search Field */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search by Admin name, email, or Entity ID..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
            />
          </div>

          {/* Action Filter Select */}
          <div className="min-w-[180px]">
            <select
              name="action"
              defaultValue={actionFilter}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-sm text-gray-700 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
            >
              <option value="">All Actions</option>
              {availableActions.map((act) => (
                <option key={act} value={act}>
                  {act}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 transition-all active:scale-[0.98]"
          >
            Apply Filters
          </button>

          {/* Reset Filters */}
          {(q || actionFilter) && (
            <Link
              href="/admin/audit-log"
              className="inline-flex justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all"
            >
              Clear
            </Link>
          )}
        </form>

        {/* Quick Action Badges */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase mr-1">Quick filters:</span>
          <Link
            href="/admin/audit-log"
            className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
              !actionFilter
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All Logs
          </Link>
          {availableActions.map((act) => (
            <Link
              key={act}
              href={`/admin/audit-log?action=${act}${q ? `&q=${q}` : ""}`}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                actionFilter === act
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {act}
            </Link>
          ))}
        </div>
      </div>

      {/* Logs Table & Details View */}
      <div className="rounded-2xl border border-gray-200/80 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 px-5 py-4 sm:px-6 flex items-center justify-between bg-gray-50/40">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Activity Registry</h2>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Showing latest {logsRaw.length} operational steps
            </p>
          </div>
          <span className="inline-flex rounded-lg bg-gray-100 px-2.5 py-1 text-[10px] font-mono text-gray-600">
            SECURED LOG
          </span>
        </div>

        <div className="divide-y divide-gray-100">
          {logsRaw.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <Terminal className="h-10 w-10 text-gray-400 mb-3" />
              <p className="text-sm font-medium text-gray-500">
                No activity logs match your filters
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Try clearing your filters or altering search terms.
              </p>
            </div>
          ) : (
            logsRaw.map((log) => {
              const actionColors: Record<string, string> = {
                CREATE: "bg-emerald-50 text-emerald-700 border-emerald-200",
                UPDATE: "bg-blue-50 text-blue-700 border-blue-200",
                DELETE: "bg-rose-50 text-rose-700 border-rose-200",
                AUTHENTICATE: "bg-purple-50 text-purple-700 border-purple-200",
                SETTINGS: "bg-amber-50 text-amber-700 border-amber-200",
              };

              return (
                <details
                  key={log.id}
                  className="group hover:bg-gray-50/30 transition-all [&_summary::-webkit-details-marker]:hidden"
                >
                  <summary className="flex flex-col gap-3 px-5 py-4 sm:px-6 cursor-pointer sm:flex-row sm:items-center sm:justify-between select-none">
                    <div className="flex items-start gap-4">
                      {/* Action Type Badge */}
                      <span
                        className={`inline-flex rounded-lg border px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase ${
                          actionColors[log.action] || "bg-gray-50 text-gray-600 border-gray-200"
                        }`}
                      >
                        {log.action}
                      </span>
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <p className="text-xs font-bold text-gray-900">{log.admin.name}</p>
                          <span className="text-[10px] text-gray-400 font-mono">
                            ({log.admin.email})
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                          <Layers className="h-3 w-3 text-gray-400" />
                          <span>Affected Entity:</span>
                          <span className="font-bold text-gray-800 font-mono">
                            {log.entity} ({log.entityId})
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 justify-between sm:justify-end text-[11px] text-gray-400">
                      <div className="flex flex-col sm:items-end gap-1 font-mono">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(log.createdAt).toLocaleString("en-BD", {
                            day: "numeric",
                            month: "short",
                            hour: "numeric",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </span>
                        {log.ip && <span>IP: {log.ip}</span>}
                      </div>
                      <div className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-600 shadow-sm transition-all group-open:bg-gray-100">
                        <Eye className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Details</span>
                        <ChevronDown className="h-3 w-3 transition-transform group-open:rotate-180" />
                      </div>
                    </div>
                  </summary>

                  {/* Expansion Content: Diff Box */}
                  <div className="border-t border-gray-100 bg-gray-50/50 px-5 py-4 sm:px-6 space-y-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Database Delta Comparison
                    </p>
                    {renderDiff(log.oldValue, log.newValue)}
                    {log.userAgent && (
                      <div className="text-[10px] font-mono text-gray-400 bg-white border border-gray-200/80 rounded-lg p-2.5">
                        <span className="font-bold text-gray-600">Client User Agent:</span>{" "}
                        {log.userAgent}
                      </div>
                    )}
                  </div>
                </details>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// Helper Component: Side-by-side JSON Diff View
// ═══════════════════════════════════════════

function renderDiff(oldVal: unknown, newVal: unknown) {
  if (!oldVal && !newVal) {
    return (
      <div className="text-xs text-gray-400 italic py-2">
        No state diff payload recorded for this action.
      </div>
    );
  }

  const oldStr = oldVal ? JSON.stringify(oldVal, null, 2) : "";
  const newStr = newVal ? JSON.stringify(newVal, null, 2) : "";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
      <div>
        <span className="text-[10px] uppercase font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 block w-max mb-1.5">
          Previous State (-)
        </span>
        {oldStr ? (
          <pre className="overflow-x-auto max-h-56 p-3 bg-rose-50/30 rounded-xl border border-rose-100 text-rose-800 leading-relaxed">
            {oldStr}
          </pre>
        ) : (
          <div className="p-3 bg-gray-50 border border-gray-150 rounded-xl text-gray-400 italic">
            None (Entity created)
          </div>
        )}
      </div>
      <div>
        <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 block w-max mb-1.5">
          New State (+)
        </span>
        {newStr ? (
          <pre className="overflow-x-auto max-h-56 p-3 bg-emerald-50/30 rounded-xl border border-emerald-100 text-emerald-800 leading-relaxed">
            {newStr}
          </pre>
        ) : (
          <div className="p-3 bg-gray-50 border border-gray-150 rounded-xl text-gray-400 italic">
            None (Entity deleted)
          </div>
        )}
      </div>
    </div>
  );
}
