import { createBrowserClient, type SupabaseClient } from "@supabase/ssr";

// Cliente de Supabase seguro para el navegador (Client Components)
// Se sincroniza automáticamente con la persistencia en cookies de la sesión

let _supabase: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (typeof window === "undefined") return null;
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    console.warn("[Supabase] Missing environment variables. Auth features disabled.");
    return null;
  }
  
  if (!_supabase) {
    _supabase = createBrowserClient(url, key);
  }
  
  return _supabase;
}

// Legacy export for backwards compatibility - may be null if env vars missing
export const supabase = typeof window !== "undefined" 
  ? (() => {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!url || !key) return null as unknown as SupabaseClient;
      return createBrowserClient(url, key);
    })()
  : null as unknown as SupabaseClient;
