import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Ruta predeterminada tras el inicio de sesión
  let next = searchParams.get("next") || "/en/builder";

  // Blindaje contra Redirecciones Abiertas (CWE-601 / Open Redirect)
  // Impedimos redirecciones a hosts externos verificando que comience estrictamente con una sola "/"
  if (!next.startsWith("/") || next.startsWith("//")) {
    next = "/en/builder";
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error("Error al intercambiar el código por sesión:", error);
  }

  // En caso de fallo en el intercambio de OAuth, redirigimos a login con un código de error controlado
  return NextResponse.redirect(`${origin}/en/auth/login?error=oauth_callback_failed`);
}
