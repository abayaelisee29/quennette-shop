import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Connexion à Supabase, uniquement côté serveur.
// La clé secrète (« secret key », ou l'ancienne « service_role ») ne doit JAMAIS aller dans le navigateur :
// elle ne figure que dans les variables d'environnement du serveur (.env.local ou Vercel).
const url = () => process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = () => process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

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
