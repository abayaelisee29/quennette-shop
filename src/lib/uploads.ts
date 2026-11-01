import "server-only";
import { randomBytes } from "crypto";
import { promises as fs } from "fs";
import path from "path";

// Les erreurs portent une clé de t.seller.errors (imageType, imageSize).
// Photos produits enregistrées dans data/uploads et servies par /api/images/[fichier].
// En production, on les mettra dans un stockage objet (Supabase Storage, S3…).
export const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads");
export const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
export const IMAGE_TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" };

export async function saveImage(file: File) {
  const ext = IMAGE_TYPES[file.type];
  if (!ext) throw new Error("imageType");
  if (file.size > MAX_IMAGE_BYTES) throw new Error("imageSize");
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const name = `${randomBytes(12).toString("hex")}.${ext}`;
  await fs.writeFile(path.join(UPLOAD_DIR, name), Buffer.from(await file.arrayBuffer()));
  return `/api/images/${name}`;
}
