/**
 * Sitara — Admin Create Coupon Page
 */

import { CreateCouponForm } from "@/components/admin/create-coupon-form";

export default function AdminNewCouponPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create Coupon</h1>
        <p className="text-sm text-gray-500">Create a new discount code for customers</p>
      </div>

      <CreateCouponForm />
    </div>
  );
}
