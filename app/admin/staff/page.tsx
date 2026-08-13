import { getStaffMembers } from "@/actions/staff.actions";
import { StaffManager } from "@/components/admin/staff-manager";
import { ShieldAlert } from "lucide-react";
import { auth } from "@/lib/auth";

export const metadata = {
  title: "Staff Management | Sitara Admin",
  description: "Manage staff roles and permissions",
};

export default async function StaffPage() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  
  if (!["ADMIN", "SUPER_ADMIN"].includes(role || "")) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 mb-4">
          <ShieldAlert className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">Access Denied</h2>
        <p className="mt-1 text-sm text-gray-500">
          You need Admin or Super Admin privileges to view this page.
        </p>
      </div>
    );
  }

  const result = await getStaffMembers();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const staff = (result.staff || []) as any[];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100">
            <ShieldAlert className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Staff Management</h1>
            <p className="mt-0.5 text-sm text-gray-500">
              Control who has access to your admin panel
            </p>
          </div>
        </div>
      </div>

      <StaffManager initialStaff={staff} currentUserRole={role || "USER"} />
    </div>
  );
}
