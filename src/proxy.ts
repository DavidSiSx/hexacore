import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["en", "es"];
const defaultLocale = "en";

function getLocale(request: NextRequest): string {
  // Check cookie first
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  if (cookieLocale && locales.includes(cookieLocale)) {
    return cookieLocale;
  }
  
  // Check Accept-Language
  const acceptLang = request.headers.get("accept-language");
  if (acceptLang) {
    if (acceptLang.includes("es")) return "es";
  }
  
  return defaultLocale;
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // 1. Inicializar el cliente Supabase y refrescar la sesión si es necesario
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Obtener usuario autenticado de forma segura a través de Supabase Auth
  const { data: { user } } = await supabase.auth.getUser();

  // 2. Control de Acceso y Enrutamiento Seguro (Auth Guards)
  const isBuilderRoute = pathname.includes("/builder");
  const isAuthRoute = pathname.includes("/auth/");

  if (isBuilderRoute && !user) {
    // Redirigir a login si intenta ir a builder siendo anónimo
    const locale = pathname.startsWith("/en") ? "en" : "es";
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = `/${locale}/auth/login`;
    return NextResponse.redirect(redirectUrl);
  }

  if (isAuthRoute && user) {
    // Redirigir a builder si el usuario ya está autenticado e intenta ir a login/register
    const locale = pathname.startsWith("/en") ? "en" : "es";
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = `/${locale}/builder`;
    return NextResponse.redirect(redirectUrl);
  }

  // 3. Manejo de Localización (Keep existing locale redirection logic)
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!pathnameHasLocale) {
    const locale = getLocale(request);
    request.nextUrl.pathname = `/${locale}${pathname}`;
    
    // Crear la redirección manteniendo las cookies actualizadas de Supabase si existen
    const redirectResponse = NextResponse.redirect(request.nextUrl);
    response.cookies.getAll().forEach(cookie => {
      redirectResponse.cookies.set(cookie.name, cookie.value, {
        domain: cookie.domain,
        path: cookie.path,
        maxAge: cookie.maxAge,
        secure: cookie.secure,
        sameSite: cookie.sameSite,
        expires: cookie.expires
      });
    });
    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: [
    // Omitir rutas de sistema (_next) y archivos estáticos
    "/((?!_next|api|.*\\..*).*)",
  ],
};
