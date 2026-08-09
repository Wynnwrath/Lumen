import { createClient } from "@supabase/supabase-js";

// Supabase only used for image storage (product photos).
// Credentials come from Vite env vars (see .env.example).
const url = import.meta.env.VITE_SUPABASE_URL ?? "";
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "";

// Created lazily so a missing Supabase config doesn't crash the app at import
// time — the storefront works fine without it; only image uploads need it.
let supabase: ReturnType<typeof createClient> | null = null;

function getSupabase() {
  if (!supabase) {
    if (!url || !key) {
      throw new Error("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.");
    }
    supabase = createClient(url, key);
  }
  return supabase;
}

const BUCKET = "product-images";

// Uploads a product image and returns its public URL.
export async function uploadProductImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const client = getSupabase();
  const { error } = await client.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;

  const { data } = client.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
