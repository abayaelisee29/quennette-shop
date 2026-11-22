import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Connexion à Supabase, uniquement côté serveur.
// La clé secrète (« secret key », ou l'ancienne « service_role ») ne doit JAMAIS aller dans le navigateur :
// elle ne figure que dans les variables d'environnement du serveur (.env.local ou Vercel).
const url = () => normalizeSupabaseUrl(process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL);

// Tolère les adresses mal copiées : espaces, « /rest/v1/ » à la fin, ou lien du tableau de bord
// (https://supabase.com/dashboard/project/<ref>). Garde seulement https://<ref>.supabase.co.
export function normalizeSupabaseUrl(raw: string | undefined): string | undefined {
  const value = raw?.trim().replace(/^["']|["']$/g, "");
  if (!value) return undefined;
  const dashboard = value.match(/supabase\.com\/dashboard\/project\/([a-z0-9]+)/i);
  if (dashboard) return `https://${dashboard[1]}.supabase.co`;
  try {
    const u = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    return u.origin;
  } catch {
    return value;
  }
}
const key = () => (process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY)?.trim();

export function supabaseConfigured() {
  return Boolean(url() && key());
}

let client: SupabaseClient | null = null;
export function supabase() {
  if (!supabaseConfigured()) throw new Error("Supabase n'est pas configuré (SUPABASE_URL / SUPABASE_SECRET_KEY).");
  client ??= createClient(url()!, key()!, { auth: { persistSession: false, autoRefreshToken: false } });
  return client;
}

// Seau Supabase Storage pour les photos produits (créé par la migration SQL).
export const IMAGE_BUCKET = "product-images";
