/**
 * Sitara — Admin Coupons Page
 */

import { getCoupons, deleteCoupon } from "@/actions/coupon.actions";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { revalidatePath } from "next/cache";

export default async function AdminCouponsPage() {
  const result = await getCoupons();
  const coupons = result.coupons || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
          <p className="text-sm text-gray-500">Manage discount codes and promotions</p>
        </div>
        <Link
          href="/admin/coupons/new"
          className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
        >
          <Plus className="h-4 w-4" />
          Create Coupon
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase text-gray-500 bg-gray-50">
              <th className="px-6 py-4 font-bold text-gray-700">Code Details</th>
              <th className="px-6 py-4 font-bold text-gray-700">Value & Rules</th>
              <th className="px-6 py-4 font-bold text-gray-700">Usage Stats</th>
              <th className="px-6 py-4 font-bold text-gray-700">Status</th>
              <th className="px-6 py-4 font-bold text-gray-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {coupons.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                  No coupons yet. Create your first coupon!
                </td>
              </tr>
            ) : (
              coupons.map((coupon) => {
                const used = coupon.usedCount || 0;
                const max = coupon.maxUses;
                const usagePercent = max ? Math.min(Math.round((used / max) * 100), 100) : 0;
                
                return (
                <tr key={coupon.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono font-black text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded">
                      {coupon.code}
                    </span>
                    <p className="text-[10px] uppercase font-bold text-gray-400 mt-2 tracking-wide">
                      {coupon.type}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black text-gray-900">
                        {coupon.type === "PERCENTAGE"
                          ? `${Number(coupon.value)}% OFF`
                          : coupon.type === "FREE_SHIPPING"
                            ? "FREE SHIPPING"
                            : `৳${Number(coupon.value)} OFF`}
                      </span>
                    </div>
                    {coupon.minOrder && (
                      <p className="text-xs text-gray-500 font-medium mt-1">
                        Min. Order: ৳{Number(coupon.minOrder)}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1.5 w-40">
                      <div className="flex justify-between text-xs font-bold text-gray-600">
                        <span>{used} Used</span>
                        {max ? <span>{max} Max</span> : <span className="text-emerald-500">∞</span>}
                      </div>
                      {max && (
                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${usagePercent > 80 ? 'bg-rose-500' : 'bg-indigo-500'}`} 
                            style={{ width: `${usagePercent}%` }}
                          />
                        </div>
                      )}
                      <p className="text-[10px] text-gray-400 font-medium">
                        {coupon.expiresAt ? `Expires: ${new Date(coupon.expiresAt).toLocaleDateString("en-BD")}` : 'Never expires'}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
                        coupon.isActive ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-rose-100 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {coupon.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <form
                      action={async () => {
                        "use server";
                        await deleteCoupon(coupon.id);
                        revalidatePath("/admin/coupons");
                      }}
                    >
                      <button
                        type="submit"
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-100 transition-colors"
                        title="Delete Coupon"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </form>
                  </td>
                </tr>
              )})
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
