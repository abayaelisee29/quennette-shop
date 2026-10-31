import { promises as fs } from "fs";
import path from "path";
import { IMAGE_TYPES, UPLOAD_DIR } from "@/lib/uploads";

export async function GET(_: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  // Nom de fichier strict : pas de « ../ » possible.
  const m = /^[a-f0-9]{24}\.(jpg|png|webp|gif)$/.exec(file);
  if (!m) return new Response("Introuvable", { status: 404 });
  try {
    const body = await fs.readFile(path.join(UPLOAD_DIR, file));
    const type = Object.keys(IMAGE_TYPES).find((t) => IMAGE_TYPES[t] === m[1])!;
    return new Response(new Uint8Array(body), { headers: { "Content-Type": type, "Cache-Control": "public, max-age=31536000, immutable" } });
  } catch {
    return new Response("Introuvable", { status: 404 });
  }
}
