/**
 * Sitara — Addresses Page
 * List, add, edit, delete, set default
 * SOP §২ — Frontend Plan F5.8
 */

"use client";

import { useEffect, useState } from "react";
import { MapPin, Plus, Trash2, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  getAddresses,
  addAddress,
  deleteAddress,
  setDefaultAddress,
} from "@/actions/account.actions";

interface Address {
  id: string;
  label: string;
  name: string;
  phone: string;
  street: string;
  area: string;
  city: string;
  postalCode: string;
  isDefault: boolean;
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    label: "",
    name: "",
    phone: "",
    street: "",
    area: "",
    city: "",
    postalCode: "",
    isDefault: false,
  });

  const loadAddresses = async () => {
    setIsLoading(true);
    setError(null);
    const res = await getAddresses();
    if (res.success && res.addresses) {
      setAddresses(res.addresses);
    } else {
      setError(res.error || "Failed to load addresses.");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    setTimeout(() => {
      loadAddresses();
    }, 0);
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    setIsMutating(true);
    setError(null);
    setSuccess(null);

    const res = await deleteAddress(id);
    if (res.success) {
      setSuccess("Address deleted successfully.");
      await loadAddresses();
    } else {
      setError(res.error || "Failed to delete address.");
    }
    setIsMutating(false);
  };

  const handleSetDefault = async (id: string) => {
    setIsMutating(true);
    setError(null);
    setSuccess(null);

    const res = await setDefaultAddress(id);
    if (res.success) {
      setSuccess("Default address updated.");
      await loadAddresses();
    } else {
      setError(res.error || "Failed to update default address.");
    }
    setIsMutating(false);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (
      !formData.name.trim() ||
      !formData.phone.trim() ||
      !formData.street.trim() ||
      !formData.city.trim() ||
      !formData.area.trim() ||
      !formData.postalCode.trim()
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    setIsMutating(true);

    const res = await addAddress({
      label: formData.label || "Home",
      address: {
        name: formData.name,
        phone: formData.phone,
        street: formData.street,
        city: formData.city,
        area: formData.area,
        postalCode: formData.postalCode,
      },
      isDefault: formData.isDefault,
    });

    if (res.success) {
      setSuccess("Address added successfully.");
      setShowForm(false);
      setFormData({
        label: "",
        name: "",
        phone: "",
        street: "",
        area: "",
        city: "",
        postalCode: "",
        isDefault: false,
      });
      await loadAddresses();
    } else {
      setError(res.error || "Failed to add address.");
    }
    setIsMutating(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Saved Addresses</h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setError(null);
            setSuccess(null);
          }}
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Add New
        </button>
      </div>

      <Separator />

      {error && (
        <div className="p-3 text-xs bg-sale/5 border border-sale/20 text-sale font-semibold uppercase tracking-wider">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 text-xs bg-success/5 border border-success/20 text-success font-semibold uppercase tracking-wider">
          {success}
        </div>
      )}

      {/* Add Address Form */}
      {showForm && (
        <form
          onSubmit={handleFormSubmit}
          className="p-4 rounded-xl border border-border space-y-4 max-w-2xl bg-[#f8f5f0]/30"
        >
          <h3 className="text-sm font-semibold">New Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Label (e.g. Home, Office)
              </label>
              <input
                type="text"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                placeholder="Home"
                className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Receiver name"
                required
                className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Phone Number *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="01XXXXXXXXX"
                required
                className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Street Address *
              </label>
              <input
                type="text"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                placeholder="House 12, Road 4"
                required
                className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Area *
              </label>
              <input
                type="text"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                placeholder="Banani / Dhanmondi"
                required
                className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                City *
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Dhaka"
                required
                className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Postal Code *
              </label>
              <input
                type="text"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                placeholder="1213"
                required
                className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex items-end pb-3">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="h-4 w-4 border-border rounded text-foreground focus:ring-foreground"
                />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Make this default address
                </span>
              </label>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isMutating}
              className="h-9 px-5 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 disabled:opacity-50 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {isMutating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Save Address
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="h-9 px-5 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Address List */}
      {addresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
          <MapPin className="h-10 w-10 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No saved addresses yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`relative p-4 rounded-xl border transition-colors ${
                address.isDefault ? "border-foreground/30 bg-muted/30" : "border-border"
              }`}
            >
              {address.isDefault && (
                <span className="absolute top-3 right-3 text-[10px] font-semibold uppercase tracking-wider bg-foreground text-background px-2 py-0.5 rounded">
                  Default
                </span>
              )}
              <div className="space-y-1">
                <p className="text-sm font-semibold">{address.label}</p>
                <p className="text-sm text-muted-foreground">{address.name}</p>
                <p className="text-sm text-muted-foreground">{address.phone}</p>
                <p className="text-sm text-muted-foreground">
                  {address.street}, {address.area}
                </p>
                <p className="text-sm text-muted-foreground">
                  {address.city} {address.postalCode}
                </p>
              </div>
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
                {!address.isDefault && (
                  <button
                    onClick={() => handleSetDefault(address.id)}
                    disabled={isMutating}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Set as Default
                  </button>
                )}
                <button
                  onClick={() => handleDelete(address.id)}
                  disabled={isMutating}
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
