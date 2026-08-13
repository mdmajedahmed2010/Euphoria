"use client";

import { deleteCustomer } from "@/actions/customer.actions";
import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function DeleteCustomerButton({ customerId }: { customerId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (
      !confirm(
        "Are you sure you want to permanently delete this customer? This will remove all their records and cannot be undone!"
      )
    ) {
      return;
    }

    if (!confirm("Confirm one more time to delete permanently?")) {
      return;
    }

    setLoading(true);
    try {
      const res = await deleteCustomer(customerId);
      if (res.success) {
        toast.success("Customer deleted permanently.");
        router.push("/admin/customers");
      } else {
        toast.error(res.error || "Failed to delete customer");
      }
    } catch (err) {
      toast.error("An error occurred during deletion");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50 cursor-pointer active:scale-95 transition-all"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      {loading ? "Deleting..." : "Delete Customer"}
    </button>
  );
}
