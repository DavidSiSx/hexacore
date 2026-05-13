import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Cliente para usar en componentes del lado del cliente (browser)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
