"use client";

import { useState } from "react";
import { assignRole, searchUsersByEmail, createStaffMember } from "@/actions/staff.actions";
import { UserPlus, Shield, Search, User as UserIcon } from "lucide-react";
import { toast } from "sonner";

export interface StaffMember {
  id: string;
  name: string | null;
  email: string;
  role: string;
}

export function StaffManager({
  initialStaff,
  currentUserRole,
}: {
  initialStaff: StaffMember[];
  currentUserRole: string;
}) {
  const [staff] = useState<StaffMember[]>(initialStaff);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<StaffMember[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (q.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const res = await searchUsersByEmail(q);
    setIsSearching(false);
    if (res.success && res.users) {
      setSearchResults(res.users);
    }
  };

  const handleAssignRole = async (userId: string, role: string) => {
    setUpdating(userId);
    const res = await assignRole(userId, role);
    setUpdating(null);

    if (res.success) {
      toast.success("Role assigned successfully");
      setTimeout(() => window.location.reload(), 1000);
    } else {
      toast.error(res.error || "Failed to update role");
    }
  };

  const handleCreateStaff = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const role = formData.get("role") as string;
    const password = formData.get("password") as string;

    setUpdating("new");
    const res = await createStaffMember({ name, email, role, password });
    setUpdating(null);

    if (res.success) {
      toast.success("Staff member created successfully");
      setTimeout(() => window.location.reload(), 1000);
    } else {
      toast.error(res.error || "Failed to create staff member");
    }
  };

  return (
    <div className="space-y-6">
      {/* Assign New Staff */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <h3 className="mb-4 text-sm font-semibold text-gray-900 flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Assign New Staff
        </h3>
        <div className="relative max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search users by email..."
              className="w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
          {isSearching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600 block" />
            </div>
          )}

          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute z-10 mt-1 w-full rounded-xl border border-gray-100 bg-white shadow-lg">
              <ul className="max-h-60 overflow-y-auto py-1">
                {searchResults.map((user) => (
                  <li
                    key={user.id}
                    className="flex items-center justify-between px-4 py-2 hover:bg-gray-50"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.name || "Unknown"}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        onChange={(e) => handleAssignRole(user.id, e.target.value)}
                        defaultValue=""
                        disabled={updating === user.id}
                        className="rounded-lg border-gray-300 text-xs py-1 pl-2 pr-6 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="" disabled>
                          Assign Role
                        </option>
                        <option value="STAFF">Staff</option>
                        <option value="MANAGER">Manager</option>
                        {currentUserRole === "SUPER_ADMIN" && <option value="ADMIN">Admin</option>}
                      </select>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {searchQuery.length >= 3 && searchResults.length === 0 && !isSearching && (
            <div className="absolute z-10 mt-1 w-full rounded-xl border border-gray-100 bg-white shadow-lg p-4">
              <p className="text-xs text-gray-500 mb-3">
                No user found. Create a new staff account:
              </p>
              <form onSubmit={handleCreateStaff} className="space-y-3">
                <input
                  required
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  className="w-full rounded border-gray-300 text-xs p-2"
                />
                <input
                  required
                  type="email"
                  name="email"
                  value={searchQuery}
                  readOnly
                  className="w-full rounded border-gray-300 text-xs p-2 bg-gray-50 text-gray-500"
                />
                <input
                  required
                  type="password"
                  name="password"
                  placeholder="Temporary Password"
                  className="w-full rounded border-gray-300 text-xs p-2"
                />
                <select required name="role" className="w-full rounded border-gray-300 text-xs p-2">
                  <option value="STAFF">Staff</option>
                  <option value="MANAGER">Manager</option>
                  {currentUserRole === "SUPER_ADMIN" && <option value="ADMIN">Admin</option>}
                </select>
                <button
                  disabled={updating === "new"}
                  type="submit"
                  className="w-full rounded bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {updating === "new" ? "Creating..." : "Create Staff Member"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Current Staff List */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 bg-gray-50/50 px-5 py-4">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Current Staff Members
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 font-medium text-gray-500 text-xs uppercase">User</th>
                <th className="px-6 py-3 font-medium text-gray-500 text-xs uppercase">Role</th>
                <th className="px-6 py-3 font-medium text-gray-500 text-xs uppercase text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {staff.map((member) => (
                <tr key={member.id} className="transition-colors hover:bg-gray-50/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                        <UserIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{member.name || "Unknown"}</p>
                        <p className="text-xs text-gray-500">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-600/20">
                      {member.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <select
                      onChange={(e) => handleAssignRole(member.id, e.target.value)}
                      value={member.role}
                      disabled={
                        updating === member.id ||
                        (member.role === "SUPER_ADMIN" && currentUserRole !== "SUPER_ADMIN")
                      }
                      className="rounded-lg border-gray-200 text-xs py-1.5 pl-3 pr-8 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:bg-gray-50"
                    >
                      <option value="CUSTOMER">Remove Access (Customer)</option>
                      <option value="STAFF">Staff</option>
                      <option value="MANAGER">Manager</option>
                      <option value="ADMIN">Admin</option>
                      {member.role === "SUPER_ADMIN" && (
                        <option value="SUPER_ADMIN">Super Admin</option>
                      )}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
