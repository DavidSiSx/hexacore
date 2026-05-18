import { createBrowserClient } from "@supabase/ssr";

// Cliente de Supabase seguro para el navegador (Client Components)
// Se sincroniza automáticamente con la persistencia en cookies de la sesión
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
