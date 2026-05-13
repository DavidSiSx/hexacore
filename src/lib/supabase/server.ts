import { createClient } from "@supabase/supabase-js";

// Cliente para usar en Server Components / Server Actions
// Usa la service role key para bypass de RLS cuando es necesario
export function createServerSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}
