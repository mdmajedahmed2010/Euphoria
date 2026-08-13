"use client";

import { useState } from "react";
import {
  createHomepageSection,
  updateHomepageSection,
  deleteHomepageSection,
} from "@/actions/homepage.actions";
import { ImageUpload } from "./image-upload";
import { Plus, Trash2, Eye, EyeOff, GripVertical, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

export function HomepageManager({
  initialSections,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialSections: any[];
}) {
  const [sections, setSections] = useState(initialSections);
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="space-y-6">
      {!showCreate && (
        <button
          onClick={() => setShowCreate(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-white py-6 text-sm font-medium text-gray-700 transition-all hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-700"
        >
          <Plus className="h-5 w-5" />
          Add Hero Banner
        </button>
      )}

      {showCreate && (
        <BannerForm
          onCancel={() => setShowCreate(false)}
          onSubmit={async (data) => {
            const res = await createHomepageSection({ ...data, type: "hero_banner" });
            if (res.success) {
              setSections([...sections, res.section]);
              setShowCreate(false);
            } else alert(res.error || "Error");
          }}
        />
      )}

      <div className="space-y-4">
        {sections.map((section) => (
          <div
            key={section.id}
            className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="cursor-move text-gray-400">
              <GripVertical className="h-5 w-5" />
            </div>

            <div className="relative h-20 w-40 shrink-0 overflow-hidden rounded-lg bg-gray-100">
              {section.content?.image ? (
                <Image
                  src={section.content.image}
                  alt={section.title || "Banner"}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400">
                  <ImageIcon />
                </div>
              )}
            </div>

            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{section.title || "Untitled Banner"}</h3>
              <p className="text-sm text-gray-500">{section.subtitle || "No subtitle"}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  const res = await updateHomepageSection(section.id, {
                    isActive: !section.isActive,
                  });
                  if (res.success) {
                    setSections(
                      sections.map((s) =>
                        s.id === section.id ? { ...s, isActive: !s.isActive } : s
                      )
                    );
                  }
                }}
                className={`rounded-lg p-2 ${section.isActive ? "text-green-600 bg-green-50" : "text-gray-400 bg-gray-50"}`}
              >
                {section.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>

              <button
                onClick={async () => {
                  if (!confirm("Delete this banner?")) return;
                  const res = await deleteHomepageSection(section.id);
                  if (res.success) {
                    setSections(sections.filter((s) => s.id !== section.id));
                  }
                }}
                className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BannerForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: {
    title: string;
    subtitle: string;
    content: { image: string; link: string };
  }) => Promise<void>;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [link, setLink] = useState("");
  const [image, setImage] = useState("");
  const [saving, setSaving] = useState(false);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-bold">New Hero Banner</h3>
      <div className="space-y-4">
        <ImageUpload
          images={image ? [image] : []}
          onChange={(imgs) => setImage(imgs[0] || "")}
          single
          folder="banners"
          label="Banner Image (Desktop/Mobile)"
          aspectRatio="aspect-[21/9]"
        />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-700">Headline</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-lg border p-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700">Sub-headline</label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="mt-1 w-full rounded-lg border p-2 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-700">Button Link</label>
          <input
            type="text"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="mt-1 w-full rounded-lg border p-2 text-sm"
            placeholder="/collections/eid-special"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              setSaving(true);
              await onSubmit({ title, subtitle, content: { image, link } });
              setSaving(false);
            }}
            disabled={saving || !image}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Banner"}
          </button>
        </div>
      </div>
    </div>
  );
}
