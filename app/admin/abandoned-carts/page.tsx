import { getAbandonedCarts } from "@/actions/abandoned-cart.actions";
import { AbandonedCartsManager } from "@/components/admin/abandoned-carts-manager";
import { ShoppingCart } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const metadata = {
  title: "Abandoned Carts | Sitara Admin",
  description: "Recover lost sales and manage abandoned carts",
};

export default async function AbandonedCartsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  
  const role = (session.user as { role?: string }).role;
  if (!["ADMIN", "SUPER_ADMIN", "MANAGER"].includes(role || "")) {
    redirect("/admin");
  }

  const result = await getAbandonedCarts();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const carts = (result.data || []) as any[];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 shadow-inner">
            <ShoppingCart className="h-5 w-5 text-rose-600" />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900 sm:text-2xl">Abandoned Carts Recovery</h1>
            <p className="mt-0.5 text-sm text-gray-500 font-medium">Turn lost checkouts into successful sales</p>
          </div>
        </div>
        
        <div className="flex gap-4 items-center bg-white border border-gray-200/60 p-3 rounded-xl shadow-sm">
          <div className="text-center px-4 border-r border-gray-100">
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Total Lost</p>
            <p className="text-lg font-black text-gray-900">{carts.length}</p>
          </div>
          <div className="text-center px-4">
            <p className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider">Recovered</p>
            <p className="text-lg font-black text-emerald-600">{carts.filter(c => c.status === "recovered").length}</p>
          </div>
        </div>
      </div>

      <AbandonedCartsManager carts={carts} />
    </div>
  );
}
