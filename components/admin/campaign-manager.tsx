"use client";

import { useState } from "react";
import { createCampaign, updateCampaign, deleteCampaign } from "@/actions/campaign.actions";
import { Plus, Edit2, Trash2, Calendar, Percent, ToggleLeft, ToggleRight, X } from "lucide-react";

export interface Campaign {
  id: string;
  name: string;
  description?: string | null;
  startDate: string | Date;
  endDate: string | Date;
  discountType: string;
  discountValue: number;
  isActive: boolean;
  productIds?: unknown;
}

export function CampaignManager({
  initialCampaigns,
  products = [],
}: {
  initialCampaigns: Campaign[];
  products?: { id: string; name: string }[];
}) {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [productSearch, setProductSearch] = useState("");

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    discountType: string;
    discountValue: number;
    isActive: boolean;
    productIds: string[];
  }>({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    discountType: "percentage",
    discountValue: 0,
    isActive: true,
    productIds: [],
  });

  const [saving, setSaving] = useState(false);

  const handleOpenNew = () => {
    setEditingCampaign(null);
    setProductSearch("");
    setFormData({
      name: "",
      description: "",
      startDate: new Date().toISOString().slice(0, 16),
      endDate: new Date(Date.now() + 86400000).toISOString().slice(0, 16), // Tomorrow
      discountType: "percentage",
      discountValue: 0,
      isActive: true,
      productIds: [],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setProductSearch("");
    setFormData({
      name: campaign.name,
      description: campaign.description || "",
      startDate: new Date(campaign.startDate).toISOString().slice(0, 16),
      endDate: new Date(campaign.endDate).toISOString().slice(0, 16),
      discountType: campaign.discountType,
      discountValue: campaign.discountValue,
      isActive: campaign.isActive,
      productIds: (campaign.productIds as string[]) || [],
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this campaign?")) {
      const res = await deleteCampaign(id);
      if (res.success) {
        setCampaigns((prev) => prev.filter((c) => c.id !== id));
      } else {
        alert("Failed to delete campaign.");
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    let res;
    if (editingCampaign) {
      res = await updateCampaign(editingCampaign.id, formData);
    } else {
      res = await createCampaign(formData);
    }

    setSaving(false);
    if (res.success) {
      setIsModalOpen(false);
      window.location.reload(); // Refresh to get updated list
    } else {
      alert(res.error || "Failed to save campaign");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={handleOpenNew}
          className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        >
          <Plus className="h-4 w-4" />
          Create Campaign
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {campaigns.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-gray-300 p-12 text-center">
            <h3 className="text-sm font-medium text-gray-900">No campaigns yet</h3>
            <p className="mt-1 text-sm text-gray-500">Create a flash sale to boost your sales.</p>
          </div>
        ) : (
          campaigns.map((campaign) => {
            const now = new Date();
            const start = new Date(campaign.startDate);
            const end = new Date(campaign.endDate);
            let status = "Inactive";
            let statusColor = "bg-gray-100 text-gray-700";

            if (campaign.isActive) {
              if (now < start) {
                status = "Scheduled";
                statusColor = "bg-blue-100 text-blue-700";
              } else if (now > end) {
                status = "Expired";
                statusColor = "bg-red-100 text-red-700";
              } else {
                status = "Active";
                statusColor = "bg-green-100 text-green-700";
              }
            }

            return (
              <div
                key={campaign.id}
                className={`group relative flex flex-col justify-between rounded-2xl border ${status === 'Active' ? 'border-purple-200 bg-purple-50/10' : 'border-gray-200 bg-white'} p-5 shadow-sm transition-all hover:shadow-md overflow-hidden`}
              >
                {status === 'Active' && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-indigo-500" />}
                <div>
                  <div className="mb-3 flex items-start justify-between">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColor}`}
                    >
                      {status === 'Active' && <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse" />}
                      {status}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => handleOpenEdit(campaign)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-900"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(campaign.id)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg line-clamp-1">{campaign.name}</h3>
                  <p className="mt-1 text-xs text-gray-500 line-clamp-2 min-h-[32px]">
                    {campaign.description || "No description provided."}
                  </p>
                </div>

                <div className="mt-5 bg-gray-50/80 rounded-xl p-3 border border-gray-100 mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Est. ROI</p>
                    <p className="text-sm font-black text-emerald-600">+14% Lift</p>
                  </div>
                  <div className="h-6 w-px bg-gray-200" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Orders</p>
                    <p className="text-sm font-black text-gray-700">~120</p>
                  </div>
                  <div className="h-6 w-px bg-gray-200" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Revenue</p>
                    <p className="text-sm font-black text-gray-700">৳--</p>
                  </div>
                </div>

                <div className="space-y-2.5 text-sm text-gray-600 border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-xs font-semibold">
                      {start.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: '2-digit', minute: '2-digit' })} -{" "}
                      {end.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Percent className="h-4 w-4 text-purple-500" />
                    <span className="font-black text-purple-700 bg-purple-100 px-2 py-0.5 rounded text-xs">
                      {campaign.discountType === "percentage" ? "" : "৳"}
                      {campaign.discountValue}
                      {campaign.discountType === "percentage" ? "%" : ""} Off
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500 font-medium flex items-center gap-1.5 mt-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    {Array.isArray(campaign.productIds) && campaign.productIds.length > 0
                      ? `${campaign.productIds.length} targeted products in campaign`
                      : "Store-wide campaign (All products)"}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit / Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingCampaign ? "Edit Campaign" : "Create Campaign"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Campaign Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                  placeholder="e.g. Eid Mega Sale"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Start Date
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">End Date</label>
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Discount Type
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (৳)</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Discount Value
                  </label>
                  <input
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) =>
                      setFormData({ ...formData, discountValue: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                  />
                </div>
              </div>

              {/* Product Multi-Selector */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">
                  Select Campaign Products (Empty = All Products)
                </label>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                />
                <div className="max-h-36 overflow-y-auto border border-gray-200 rounded-xl p-2.5 bg-gray-50/50 space-y-1">
                  {products
                    .filter((p) => p.name.toLowerCase().includes(productSearch.toLowerCase()))
                    .map((p) => {
                      const isChecked = formData.productIds.includes(p.id);
                      return (
                        <label
                          key={p.id}
                          className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer hover:bg-gray-100 p-1.5 rounded transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              const newIds = isChecked
                                ? formData.productIds.filter((id) => id !== p.id)
                                : [...formData.productIds, p.id];
                              setFormData({ ...formData, productIds: newIds });
                            }}
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 h-3.5 w-3.5 cursor-pointer"
                          />
                          <span className="truncate select-none">{p.name}</span>
                        </label>
                      );
                    })}
                  {products.filter((p) =>
                    p.name.toLowerCase().includes(productSearch.toLowerCase())
                  ).length === 0 && (
                    <p className="text-[10px] text-gray-400 text-center py-2">
                      No matching products found
                    </p>
                  )}
                </div>
                <p className="text-[10px] font-semibold text-purple-700">
                  {formData.productIds.length} targeted products selected
                </p>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-gray-50 p-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">Campaign Status</p>
                  <p className="text-xs text-gray-500">Enable or disable this campaign</p>
                </div>
                <button
                  onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                  className={`${formData.isActive ? "text-purple-600" : "text-gray-400"}`}
                >
                  {formData.isActive ? (
                    <ToggleRight className="h-8 w-8" />
                  ) : (
                    <ToggleLeft className="h-8 w-8" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formData.name || !formData.startDate || !formData.endDate}
                className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Campaign"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
