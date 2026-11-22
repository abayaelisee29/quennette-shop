import "server-only";
import { randomBytes } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { IMAGE_BUCKET, supabase, supabaseConfigured } from "./supabase";

// Les erreurs portent une clé de t.seller.errors (imageType, imageSize).
// Avec Supabase : photos dans le seau Supabase Storage « product-images » (adresse publique).
// Sans Supabase : photos dans data/uploads, servies par /api/images/[fichier].
export const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads");
export const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
export const IMAGE_TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" };

export async function saveImage(file: File) {
  const ext = IMAGE_TYPES[file.type];
  if (!ext) throw new Error("imageType");
  if (file.size > MAX_IMAGE_BYTES) throw new Error("imageSize");
  const name = `${randomBytes(12).toString("hex")}.${ext}`;
  const body = Buffer.from(await file.arrayBuffer());

  if (supabaseConfigured()) {
    const storage = supabase().storage.from(IMAGE_BUCKET);
    const { error } = await storage.upload(name, body, { contentType: file.type, cacheControl: "31536000", upsert: false });
    if (error) throw new Error(`Supabase Storage : ${error.message}`);
    return storage.getPublicUrl(name).data.publicUrl;
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, name), body);
  return `/api/images/${name}`;
}
