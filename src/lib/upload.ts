import { supabase } from "@/integrations/supabase/client";

const BUCKET = "product-images";
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_DIMENSION = 1200;
const JPEG_QUALITY = 0.8;

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

/**
 * Compress and resize an image file, then upload it to Supabase Storage.
 * Returns the public URL of the uploaded image.
 */
export async function uploadProductImage(
  file: File,
  productCode: string,
): Promise<{ url: string; error?: never } | { url?: never; error: string }> {
  if (!ALLOWED_TYPES.has(file.type)) {
    return { error: "Only JPEG, PNG and WebP images are allowed." };
  }
  if (file.size > MAX_SIZE) {
    return { error: "Image must be under 5 MB." };
  }

  const compressed = await compressImage(file);
  const ext = "jpg";
  const path = `${productCode}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, compressed, {
    contentType: "image/jpeg",
    upsert: true,
  });

  if (error) return { error: error.message };

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl };
}

function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas not supported"));

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Compression failed"))),
        "image/jpeg",
        JPEG_QUALITY,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
  });
}
