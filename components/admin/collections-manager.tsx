"use client";

/**
 * Euphoria — Collections Manager
 * Create, edit, delete, reorder collections
 */

import { useState } from "react";
import { createCollection, updateCollection, deleteCollection } from "@/actions/collection.actions";
import { ImageUpload } from "./image-upload";
import { Plus, Trash2, Edit2, Eye, EyeOff, Star, X, Save } from "lucide-react";
import Image from "next/image";

interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  bannerImage: string | null;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  productIds: unknown;
}

interface CollectionsManagerProps {
  initialCollections: Collection[];
  allProducts: { id: string; name: string; slug: string }[];
}

export function CollectionsManager({ initialCollections, allProducts }: CollectionsManagerProps) {
  const [collections, setCollections] = useState<Collection[]>(initialCollections);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="space-y-4">
      {/* Create Button */}
      {!showCreate && (
        <button
          onClick={() => setShowCreate(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-white py-4 text-sm font-medium text-gray-700 transition-all hover:border-purple-300 hover:bg-purple-50/50 hover:text-purple-700 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Create New Collection
        </button>
      )}

      {/* Create Form */}
      {showCreate && (
        <CollectionForm
          allProducts={allProducts}
          onCancel={() => setShowCreate(false)}
          onSubmit={async (data) => {
            const result = await createCollection(data);
            if (result.success && result.collection) {
              setCollections([...collections, result.collection as Collection]);
              setShowCreate(false);
            } else {
              alert(result.error || "Failed to create");
            }
          }}
        />
      )}

      {/* Collections List */}
      {collections.length === 0 && !showCreate ? (
        <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <Sparkles className="h-5 w-5 text-gray-400" />
          </div>
          <p className="mt-3 text-sm font-medium text-gray-700">No collections yet</p>
          <p className="mt-1 text-xs text-gray-500">
            Create curated product groups like &quot;Eid Special&quot;, &quot;New Arrivals&quot;
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              allProducts={allProducts}
              isEditing={editingId === collection.id}
              onEdit={() => setEditingId(collection.id)}
              onClose={() => setEditingId(null)}
              onUpdate={(updated) =>
                setCollections(collections.map((c) => (c.id === updated.id ? updated : c)))
              }
              onDelete={async () => {
                if (!confirm(`Delete "${collection.name}"?`)) return;
                const result = await deleteCollection(collection.id);
                if (result.success) {
                  setCollections(collections.filter((c) => c.id !== collection.id));
                }
              }}
              onToggleActive={async () => {
                const result = await updateCollection(collection.id, {
                  isActive: !collection.isActive,
                });
                if (result.success) {
                  setCollections(
                    collections.map((c) =>
                      c.id === collection.id ? { ...c, isActive: !c.isActive } : c
                    )
                  );
                }
              }}
              onToggleFeatured={async () => {
                const result = await updateCollection(collection.id, {
                  isFeatured: !collection.isFeatured,
                });
                if (result.success) {
                  setCollections(
                    collections.map((c) =>
                      c.id === collection.id ? { ...c, isFeatured: !c.isFeatured } : c
                    )
                  );
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// Collection Card
// ═══════════════════════════════════════════

function CollectionCard({
  collection,
  allProducts,
  isEditing,
  onEdit,
  onClose,
  onUpdate,
  onDelete,
  onToggleActive,
  onToggleFeatured,
}: {
  collection: Collection;
  allProducts: { id: string; name: string; slug: string }[];
  isEditing: boolean;
  onEdit: () => void;
  onClose: () => void;
  onUpdate: (c: Collection) => void;
  onDelete: () => void;
  onToggleActive: () => void;
  onToggleFeatured: () => void;
}) {
  if (isEditing) {
    return (
      <div className="rounded-2xl border-2 border-purple-300 bg-white p-4 shadow-sm sm:col-span-2 lg:col-span-3">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Edit: {collection.name}</h3>
          <button onClick={onClose} className="rounded p-1 hover:bg-gray-100 cursor-pointer">
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>
        <CollectionForm
          collection={collection}
          allProducts={allProducts}
          onCancel={onClose}
          onSubmit={async (data) => {
            const result = await updateCollection(collection.id, data);
            if (result.success && result.collection) {
              onUpdate(result.collection as Collection);
              onClose();
            } else {
              alert(result.error || "Failed to update");
            }
          }}
        />
      </div>
    );
  }

  const productCount = Array.isArray(collection.productIds) ? collection.productIds.length : 0;

  return (
    <div
      className={`rounded-2xl border bg-white shadow-sm transition-all ${
        collection.isActive ? "border-gray-200" : "border-gray-200 opacity-60"
      }`}
    >
      {/* Image */}
      <div className="relative aspect-video overflow-hidden rounded-t-2xl bg-gray-100">
        {collection.image ? (
          <Image
            src={collection.image}
            alt={collection.name}
            fill
            className="object-cover"
            sizes="400px"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Sparkles className="h-8 w-8 text-gray-300" />
          </div>
        )}
        {collection.isFeatured && (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-bold text-yellow-700">
            <Star className="h-2.5 w-2.5 fill-current" /> FEATURED
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-900">{collection.name}</h3>
        <p className="mt-0.5 text-xs text-gray-500">/{collection.slug}</p>
        {collection.description && (
          <p className="mt-2 line-clamp-2 text-xs text-gray-600">{collection.description}</p>
        )}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-gray-400">{productCount} products</span>
          <div className="flex items-center gap-1">
            <button
              onClick={onToggleFeatured}
              className={`rounded p-1.5 cursor-pointer ${collection.isFeatured ? "text-yellow-600 hover:bg-yellow-50" : "text-gray-400 hover:bg-gray-100"}`}
              title={collection.isFeatured ? "Unfeature" : "Feature"}
            >
              <Star
                className="h-3.5 w-3.5"
                fill={collection.isFeatured ? "currentColor" : "none"}
              />
            </button>
            <button
              onClick={onToggleActive}
              className={`rounded p-1.5 cursor-pointer ${collection.isActive ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:bg-gray-100"}`}
              title={collection.isActive ? "Hide" : "Show"}
            >
              {collection.isActive ? (
                <Eye className="h-3.5 w-3.5" />
              ) : (
                <EyeOff className="h-3.5 w-3.5" />
              )}
            </button>
            <button
              onClick={onEdit}
              className="rounded p-1.5 text-blue-600 hover:bg-blue-50 cursor-pointer"
              title="Edit"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={onDelete}
              className="rounded p-1.5 text-red-500 hover:bg-red-50 cursor-pointer"
              title="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// Collection Form
// ═══════════════════════════════════════════

import { resolveSmartCollectionRules } from "@/actions/collection.actions";

function CollectionForm({
  collection,
  allProducts,
  onSubmit,
  onCancel,
}: {
  collection?: Collection;
  allProducts: { id: string; name: string; slug: string }[];
  onSubmit: (data: {
    name: string;
    description?: string;
    image?: string;
    bannerImage?: string;
    isFeatured?: boolean;
    productIds?: unknown;
  }) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(collection?.name || "");
  const [description, setDescription] = useState(collection?.description || "");
  const [image, setImage] = useState(collection?.image || "");
  const [bannerImage, setBannerImage] = useState(collection?.bannerImage || "");
  const [isFeatured, setIsFeatured] = useState(collection?.isFeatured || false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const initialProductIdsData = collection?.productIds as any;
  const isSmartInit =
    initialProductIdsData &&
    typeof initialProductIdsData === "object" &&
    !Array.isArray(initialProductIdsData);

  const [mode, setMode] = useState<"manual" | "smart">(isSmartInit ? "smart" : "manual");

  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(
    Array.isArray(initialProductIdsData)
      ? initialProductIdsData
      : isSmartInit
        ? initialProductIdsData.cachedIds || []
        : []
  );

  const [rules, setRules] = useState<{
    keyword: string;
    minPrice: string;
    maxPrice: string;
    status: string;
  }>(
    isSmartInit && initialProductIdsData.rules
      ? {
          keyword: initialProductIdsData.rules.keyword || "",
          minPrice: initialProductIdsData.rules.minPrice?.toString() || "",
          maxPrice: initialProductIdsData.rules.maxPrice?.toString() || "",
          status: initialProductIdsData.rules.status || "",
        }
      : { keyword: "", minPrice: "", maxPrice: "", status: "" }
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [saving, setSaving] = useState(false);
  const [resolving, setResolving] = useState(false);

  async function handleApplyRules() {
    setResolving(true);
    const parsedRules = {
      keyword: rules.keyword || undefined,
      minPrice: rules.minPrice ? Number(rules.minPrice) : undefined,
      maxPrice: rules.maxPrice ? Number(rules.maxPrice) : undefined,
      status: rules.status
        ? (rules.status as "ACTIVE" | "DRAFT" | "OUT_OF_STOCK" | "ARCHIVED")
        : undefined,
    };
    const res = await resolveSmartCollectionRules(parsedRules);
    if (res.success) {
      setSelectedProductIds(res.productIds);
      alert(`Found ${res.productIds.length} matching products.`);
    } else {
      alert("Failed to resolve rules.");
    }
    setResolving(false);
  }

  async function handleSave() {
    if (!name.trim()) {
      alert("Name is required");
      return;
    }
    setSaving(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let finalProductIdsData: any = selectedProductIds;
    if (mode === "smart") {
      finalProductIdsData = {
        mode: "smart",
        rules: {
          keyword: rules.keyword || undefined,
          minPrice: rules.minPrice ? Number(rules.minPrice) : undefined,
          maxPrice: rules.maxPrice ? Number(rules.maxPrice) : undefined,
          status: rules.status || undefined,
        },
        cachedIds: selectedProductIds,
      };
    }

    await onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      image: image || undefined,
      bannerImage: bannerImage || undefined,
      isFeatured,
      productIds: finalProductIdsData,
    });
    setSaving(false);
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Collection Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
            placeholder="e.g., Eid Special, Summer 2026"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
            rows={2}
            placeholder="Brief description of this collection"
          />
        </div>

        <ImageUpload
          images={image ? [image] : []}
          onChange={(imgs) => setImage(imgs[0] || "")}
          single
          folder="collections"
          label="Cover Image"
          aspectRatio="aspect-video"
        />

        <ImageUpload
          images={bannerImage ? [bannerImage] : []}
          onChange={(imgs) => setBannerImage(imgs[0] || "")}
          single
          folder="collections"
          label="Banner Image (optional)"
          aspectRatio="aspect-[3/1]"
        />

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-400"
          />
          <span className="text-sm text-gray-700 select-none">Mark as featured</span>
        </label>

        {/* Collection Type Toggle */}
        <div className="border-t border-gray-100 pt-4">
          <label className="block text-xs font-semibold text-gray-700 mb-2">Collection Type</label>
          <div className="flex bg-gray-100 rounded-lg p-1 w-fit">
            <button
              onClick={() => setMode("manual")}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${mode === "manual" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
            >
              Manual Selection
            </button>
            <button
              onClick={() => setMode("smart")}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${mode === "smart" ? "bg-white shadow-sm text-purple-700" : "text-gray-500 hover:text-gray-700"}`}
            >
              Smart Rules (Auto-populate)
            </button>
          </div>
        </div>

        {mode === "smart" && (
          <div className="bg-purple-50/50 border border-purple-100 rounded-lg p-4 space-y-3">
            <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Smart Rules
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                  Title Contains
                </label>
                <input
                  type="text"
                  value={rules.keyword}
                  onChange={(e) => setRules({ ...rules, keyword: e.target.value })}
                  className="w-full text-xs p-1.5 border border-gray-200 rounded"
                  placeholder="e.g. Shirt"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                  Status
                </label>
                <select
                  value={rules.status}
                  onChange={(e) => setRules({ ...rules, status: e.target.value })}
                  className="w-full text-xs p-1.5 border border-gray-200 rounded"
                >
                  <option value="">Any Status</option>
                  <option value="ACTIVE">Active Only</option>
                  <option value="DRAFT">Draft</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                  Min Price (৳)
                </label>
                <input
                  type="number"
                  value={rules.minPrice}
                  onChange={(e) => setRules({ ...rules, minPrice: e.target.value })}
                  className="w-full text-xs p-1.5 border border-gray-200 rounded"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                  Max Price (৳)
                </label>
                <input
                  type="number"
                  value={rules.maxPrice}
                  onChange={(e) => setRules({ ...rules, maxPrice: e.target.value })}
                  className="w-full text-xs p-1.5 border border-gray-200 rounded"
                  placeholder="9999"
                />
              </div>
            </div>
            <div className="flex justify-end mt-2">
              <button
                onClick={handleApplyRules}
                disabled={resolving}
                className="bg-purple-600 text-white text-xs px-3 py-1.5 rounded font-medium hover:bg-purple-700 disabled:opacity-50"
              >
                {resolving ? "Resolving..." : "Apply Rules & Preview"}
              </button>
            </div>
          </div>
        )}

        {/* Product Selection Picker */}
        <div className="space-y-2 border-t border-gray-100 pt-3">
          <label className="block text-xs font-semibold text-gray-700">
            {mode === "smart" ? "Matched Products" : "Assign Products to Collection"} (
            {selectedProductIds.length} Selected)
          </label>
          {mode === "manual" && (
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs focus:border-purple-400 focus:outline-none"
              placeholder="🔍 Search products by name..."
            />
          )}
          <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2.5 space-y-1.5 bg-gray-50/50">
            {allProducts
              .filter((p) => {
                if (mode === "smart") return selectedProductIds.includes(p.id);
                return p.name.toLowerCase().includes(searchTerm.toLowerCase());
              })
              .map((product) => {
                const isChecked = selectedProductIds.includes(product.id);
                return (
                  <label
                    key={product.id}
                    className={`flex items-center gap-2.5 px-2 py-1 rounded-md text-xs transition-colors ${mode === "manual" ? "hover:bg-purple-50/45 cursor-pointer" : "opacity-80 cursor-default"}`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      disabled={mode === "smart"}
                      onChange={() => {
                        if (mode === "smart") return;
                        if (isChecked) {
                          setSelectedProductIds(
                            selectedProductIds.filter((id) => id !== product.id)
                          );
                        } else {
                          setSelectedProductIds([...selectedProductIds, product.id]);
                        }
                      }}
                      className="h-3.5 w-3.5 rounded text-purple-600 focus:ring-purple-400 border-gray-300 disabled:opacity-50"
                    />
                    <span
                      className={`font-medium ${isChecked ? "text-purple-950 font-bold" : "text-gray-700"}`}
                    >
                      {product.name}
                    </span>
                  </label>
                );
              })}
            {mode === "manual" &&
              allProducts.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .length === 0 && (
                <p className="text-center text-xs text-gray-400 py-4">No matching products found</p>
              )}
            {mode === "smart" && selectedProductIds.length === 0 && (
              <p className="text-center text-xs text-gray-400 py-4">
                No products match your rules yet. Hit &quot;Apply Rules &amp; Preview&quot;.
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
          <button
            onClick={onCancel}
            className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-4 py-2 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-50 cursor-pointer"
          >
            <Save className="h-3.5 w-3.5" />
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Inline icon
function Sparkles({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
      />
    </svg>
  );
}
