/**
 * Benarasi Kuthi — Local Image Upload Utility
 * Demo mode: Saves images to /public/images/uploads/ instead of Cloudinary
 * No external cloud dependency required for client demonstrations
 */

import { UPLOAD_LIMITS } from "./constants";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

interface UploadResult {
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
}

// ═══════════════════════════════════════════
// LOCAL UPLOAD FUNCTION (No Cloudinary needed)
// ═══════════════════════════════════════════

/**
 * Upload image locally to /public/images/uploads/
 * Falls back to Cloudinary if credentials are available
 */
export async function uploadImage(
  file: File | string,
  folder: string = "products"
): Promise<UploadResult> {
  // Try Cloudinary first if credentials exist
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (cloudName && apiKey && apiSecret) {
    return await uploadToCloudinary(file, folder, { cloudName, apiKey, apiSecret });
  }

  // Local fallback — save to /public/images/uploads/
  return await uploadToLocal(file, folder);
}

/**
 * Upload to local filesystem
 */
async function uploadToLocal(file: File | string, folder: string): Promise<UploadResult> {
  try {
    let buffer: Buffer;
    let filename: string;
    let mimeType: string = "image/jpeg";

    if (file instanceof File) {
      // Validate file type
      if (
        !UPLOAD_LIMITS.ALLOWED_TYPES.includes(
          file.type as (typeof UPLOAD_LIMITS.ALLOWED_TYPES)[number]
        )
      ) {
        return {
          success: false,
          error: `Invalid file type. Allowed: ${UPLOAD_LIMITS.ALLOWED_TYPES.join(", ")}`,
        };
      }

      // Validate file size
      if (file.size > UPLOAD_LIMITS.MAX_SIZE_BYTES) {
        return {
          success: false,
          error: `File too large. Maximum size: ${UPLOAD_LIMITS.MAX_SIZE_MB}MB`,
        };
      }

      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      mimeType = file.type;

      const ext = file.type.split("/")[1] || "jpg";
      filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    } else {
      // base64 data URL
      const matches = file.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
      if (!matches) {
        return { success: false, error: "Invalid base64 data URL" };
      }
      mimeType = matches[1] as string;
      buffer = Buffer.from(matches[2] as string, "base64");
      const ext = mimeType.split("/")[1] || "jpg";
      filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    }

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), "public", "images", "uploads", folder);
    await mkdir(uploadDir, { recursive: true });

    // Write file
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    const publicUrl = `/images/uploads/${folder}/${filename}`;

    console.log(`[LOCAL UPLOAD] Saved image to: ${publicUrl}`);

    return {
      success: true,
      url: publicUrl,
      publicId: `local/${folder}/${filename}`,
    };
  } catch (error) {
    console.error("[LOCAL UPLOAD] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

/**
 * Upload to Cloudinary (when credentials are available)
 */
async function uploadToCloudinary(
  file: File | string,
  folder: string,
  credentials: { cloudName: string; apiKey: string; apiSecret: string }
): Promise<UploadResult> {
  const { cloudName, apiKey, apiSecret } = credentials;

  try {
    let fileData: string;

    if (file instanceof File) {
      if (
        !UPLOAD_LIMITS.ALLOWED_TYPES.includes(
          file.type as (typeof UPLOAD_LIMITS.ALLOWED_TYPES)[number]
        )
      ) {
        return {
          success: false,
          error: `Invalid file type. Allowed: ${UPLOAD_LIMITS.ALLOWED_TYPES.join(", ")}`,
        };
      }

      if (file.size > UPLOAD_LIMITS.MAX_SIZE_BYTES) {
        return {
          success: false,
          error: `File too large. Maximum size: ${UPLOAD_LIMITS.MAX_SIZE_MB}MB`,
        };
      }

      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      fileData = `data:${file.type};base64,${base64}`;
    } else {
      fileData = file;
    }

    const timestamp = Math.round(Date.now() / 1000);
    const paramsToSign = `folder=benarasikuthi/${folder}&timestamp=${timestamp}`;

    const crypto = await import("crypto");
    const signature = crypto
      .createHash("sha1")
      .update(paramsToSign + apiSecret)
      .digest("hex");

    const formData = new FormData();
    formData.append("file", fileData);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp.toString());
    formData.append("signature", signature);
    formData.append("folder", `benarasikuthi/${folder}`);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: formData }
    );

    if (!response.ok) {
      const errorData = await response.json();
      // Fall back to local if Cloudinary fails
      console.warn("[CLOUDINARY] Upload failed, falling back to local storage");
      return await uploadToLocal(file, folder);
    }

    const data = await response.json();

    return {
      success: true,
      url: data.secure_url,
      publicId: data.public_id,
    };
  } catch (error) {
    console.error("[CLOUDINARY] Upload error, falling back to local:", error);
    return await uploadToLocal(file, folder);
  }
}

/**
 * Delete image — supports both local and Cloudinary
 */
export async function deleteImage(publicId: string): Promise<{ success: boolean }> {
  if (publicId.startsWith("local/")) {
    // Local file delete
    try {
      const { unlink } = await import("fs/promises");
      const relativePath = publicId.replace("local/", "");
      const filePath = path.join(process.cwd(), "public", "images", relativePath);
      await unlink(filePath);
      return { success: true };
    } catch {
      return { success: false };
    }
  }

  // Cloudinary delete
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return { success: true }; // Graceful no-op in demo mode
  }

  try {
    const timestamp = Math.round(Date.now() / 1000);
    const paramsToSign = `public_id=${publicId}&timestamp=${timestamp}`;

    const crypto = await import("crypto");
    const signature = crypto
      .createHash("sha1")
      .update(paramsToSign + apiSecret)
      .digest("hex");

    const formData = new FormData();
    formData.append("public_id", publicId);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp.toString());
    formData.append("signature", signature);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: "POST",
      body: formData,
    });

    return { success: response.ok };
  } catch {
    return { success: false };
  }
}

/**
 * Get optimized URL — works for both local and Cloudinary URLs
 */
export function getOptimizedUrl(
  url: string,
  options?: { width?: number; height?: number; quality?: number }
): string {
  if (!url) return url;

  // Local URL — return as-is
  if (!url.includes("cloudinary.com")) return url;

  // Cloudinary URL — apply transformations
  const { width = 800, quality = 80 } = options || {};
  return url.replace("/upload/", `/upload/w_${width},q_${quality},f_auto/`);
}
