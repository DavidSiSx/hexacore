import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Cliente de Supabase seguro para el servidor (Server Components y Server Actions)
// Lee y escribe la sesión del usuario mediante cookies asíncronas en Next.js 16/15
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // El método setAll puede fallar si se llama desde un Server Component
            // Esto es normal y seguro si el Middleware (Proxy) refresca la sesión
          }
        },
      },
    }
  );
}

// Cliente de Supabase administrador que hace bypass de RLS
// ¡USAR EXCLUSIVAMENTE para operaciones críticas de administración que requieran bypass de RLS!
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error("Falta la variable SUPABASE_SERVICE_ROLE_KEY para el cliente administrativo.");
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {},
      },
    }
  );
}
