import { createClient } from "@supabase/supabase-js";

// Supabase only used for image storage (product photos).
// Credentials come from Vite env vars (see .env.example).
const url = import.meta.env.VITE_SUPABASE_URL ?? "";
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "";

const supabase = createClient(url, key);

const BUCKET = "product-images";

// Uploads a product image and returns its public URL.
export async function uploadProductImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
