"use client";

/**
 * Euphoria — Advanced Image Upload Component
 * Features: Drag & drop, multi-upload, preview, replace, remove
 * Uploads to Cloudinary via /api/upload
 */

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Upload, X, ImagePlus, Loader2, GripVertical } from "lucide-react";

interface ImageUploadProps {
  /** Current images (URLs) */
  images: string[];
  /** Callback when images change */
  onChange: (images: string[]) => void;
  /** Max number of images allowed */
  maxImages?: number;
  /** Upload folder in Cloudinary */
  folder?: string;
  /** Label text */
  label?: string;
  /** Single image mode (replaces instead of adding) */
  single?: boolean;
  /** Aspect ratio for preview */
  aspectRatio?: string;
}

// Client-side image compression utility using off-screen HTML5 Canvas
function compressImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    // If it's a GIF, skip compression to preserve animation frames
    if (file.type === "image/gif") {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Downscale dimensions to 1200px max (preserving original aspect ratio)
        const maxDimension = 1200;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to highly-optimized JPEG at 80% quality (under 250KB average)
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          "image/jpeg",
          0.8
        );
      };
      img.onerror = () => {
        resolve(file);
      };
    };
    reader.onerror = () => {
      resolve(file);
    };
  });
}

export function ImageUpload({
  images,
  onChange,
  maxImages = 10,
  folder = "products",
  label = "Images",
  single = false,
  aspectRatio = "aspect-square",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const effectiveMax = single ? 1 : maxImages;

  const uploadFile = useCallback(
    async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }

      const data = await res.json();
      return data.url as string;
    },
    [folder]
  );

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      setError(null);
      const fileArray = Array.from(files);

      // Validate count
      const remaining = effectiveMax - images.length;
      if (remaining <= 0 && !single) {
        setError(`Maximum ${effectiveMax} images allowed`);
        return;
      }

      const filesToUpload = single ? [fileArray[0]] : fileArray.slice(0, remaining);

      // Validate types
      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      for (const file of filesToUpload) {
        if (!file) continue;
        if (!allowedTypes.includes(file.type)) {
          setError("Only JPG, PNG, WebP, GIF allowed");
          return;
        }
        // Support larger local files (up to 15MB) because client-side compression handles them easily
        if (file.size > 15 * 1024 * 1024) {
          setError("Max file size: 15MB");
          return;
        }
      }

      setUploading(true);

      try {
        // Compress all selected images client-side before triggering uploads
        const compressedFiles = await Promise.all(
          filesToUpload.filter((f): f is File => f !== undefined).map((file) => compressImage(file))
        );

        const uploadPromises = compressedFiles.map((file) => uploadFile(file));
        const urls = await Promise.all(uploadPromises);

        if (single) {
          onChange(urls);
        } else {
          onChange([...images, ...urls]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [images, onChange, effectiveMax, single, uploadFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handleRemove = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleReorder = (fromIndex: number, toIndex: number) => {
    const updated = [...images];
    const [moved] = updated.splice(fromIndex, 1);
    if (moved) updated.splice(toIndex, 0, moved);
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-xs text-gray-400">
          {images.length}/{effectiveMax}
        </span>
      </div>

      {/* Image Previews */}
      {images.length > 0 && (
        <div
          className={`grid gap-3 ${single ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"}`}
        >
          {images.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className={`group relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50 ${aspectRatio}`}
            >
              <Image
                src={url}
                alt={`Image ${index + 1}`}
                fill
                className="object-cover"
                sizes="200px"
              />
              {/* Overlay actions */}
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
                {!single && images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleReorder(index, Math.max(0, index - 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow hover:bg-white"
                    title="Move left"
                  >
                    <GripVertical className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600"
                  title="Remove"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {/* First image badge */}
              {index === 0 && !single && (
                <span className="absolute left-2 top-2 rounded bg-blue-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
                  MAIN
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Zone */}
      {(images.length < effectiveMax || single) && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-all ${
            dragOver
              ? "border-blue-400 bg-blue-50"
              : "border-gray-200 bg-gray-50/50 hover:border-gray-300 hover:bg-gray-50"
          } ${uploading ? "pointer-events-none opacity-60" : ""}`}
        >
          {uploading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <p className="mt-2 text-sm font-medium text-gray-600">Uploading...</p>
            </>
          ) : (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                {single ? (
                  <ImagePlus className="h-5 w-5 text-gray-400" />
                ) : (
                  <Upload className="h-5 w-5 text-gray-400" />
                )}
              </div>
              <p className="mt-3 text-sm font-medium text-gray-700">
                {single ? "Click or drag to upload" : "Drop images here or click to browse"}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                JPG, PNG, WebP • Max 5MB {!single && `• Up to ${effectiveMax} images`}
              </p>
            </>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple={!single}
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);
            e.target.value = ""; // Reset for re-upload
          }
        }}
      />

      {/* Error */}
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}
