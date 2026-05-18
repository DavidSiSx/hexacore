"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { LogIn, Mail, Lock, AlertTriangle } from "lucide-react";
import { useTheme } from "@/app/components/Shared/ThemeProvider";

export default function LoginPage() {
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const { activeTheme } = useTheme();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEs = lang === "es";

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // La redirección al constructor es segura tras sincronizar cookies de sesión
    router.push(`/${lang}/builder`);
    router.refresh();
  }

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { 
        redirectTo: `${window.location.origin}/api/auth/callback?next=/${lang}/builder` 
      },
    });
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16 bg-[var(--background)]">
      <div className={`w-full max-w-md border-4 ${activeTheme.borderClass} ${activeTheme.cardBgClass || "bg-zinc-950"} p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative`}>
        {/* Header */}
        <div className={`text-center mb-8 border-b-4 ${activeTheme.borderClass} pb-6`}>
          <h1 className={`text-4xl font-black uppercase tracking-tighter ${activeTheme.accentClass} mb-2`}>
            {isEs ? "Iniciar Sesión" : "Login"}
          </h1>
          <p className={`${activeTheme.textMutedClass || "text-zinc-400"} text-[10px] font-black uppercase tracking-widest`}>
            {isEs ? "Accede para construir equipos con IA" : "Log in to build teams with AI"}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-[var(--danger)]/20 border-4 border-[var(--danger)] p-4 mb-6 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[var(--danger)] shrink-0 mt-0.5" strokeWidth={3} />
            <p className="text-[var(--danger)] text-xs font-bold uppercase">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className={`text-[10px] font-black uppercase tracking-widest ${activeTheme.textMutedClass || "text-zinc-500"} flex items-center gap-2`}>
              <Mail className="w-3.5 h-3.5" strokeWidth={3} /> Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`w-full bg-[var(--background)] border-4 ${activeTheme.borderClass} px-4 py-3
                         text-sm text-[var(--foreground)] font-bold
                         focus:outline-none focus:border-[var(--accent)] transition-none`}
              placeholder="tu@email.com"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className={`text-[10px] font-black uppercase tracking-widest ${activeTheme.textMutedClass || "text-zinc-500"} flex items-center gap-2`}>
              <Lock className="w-3.5 h-3.5" strokeWidth={3} /> {isEs ? "Contraseña" : "Password"}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={`w-full bg-[var(--background)] border-4 ${activeTheme.borderClass} px-4 py-3
                         text-sm text-[var(--foreground)] font-bold
                         focus:outline-none focus:border-[var(--accent)] transition-none`}
              placeholder="********"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-[var(--accent)] text-[var(--accent-foreground)] border-4 border-[var(--accent)]
                       font-black uppercase tracking-tighter text-lg py-4
                       hover:bg-[var(--foreground)] hover:text-[var(--background)] hover:border-[var(--foreground)]
                       disabled:opacity-40 disabled:pointer-events-none
                       active:scale-95 transition-none flex items-center justify-center gap-2 cursor-pointer`}
          >
            <LogIn className="w-5 h-5" strokeWidth={3} />
            {loading ? (isEs ? "Entrando..." : "Entering...") : (isEs ? "Entrar" : "Log In")}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-8">
          <div className={`flex-1 h-1 ${activeTheme.borderClass} bg-zinc-800`} />
          <span className={`${activeTheme.textMutedClass || "text-zinc-500"} text-[10px] font-black uppercase tracking-widest`}>
            {isEs ? "o" : "or"}
          </span>
          <div className={`flex-1 h-1 ${activeTheme.borderClass} bg-zinc-800`} />
        </div>

        {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
          className={`w-full flex items-center justify-center gap-3 border-4 ${activeTheme.borderClass}
                     text-[var(--foreground)] text-xs font-black uppercase tracking-widest
                     py-4 hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] hover:border-[var(--accent)]
                     active:scale-95 transition-none cursor-pointer`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {isEs ? "Continuar con Google" : "Continue with Google"}
        </button>

        {/* Register Link */}
        <p className={`text-center text-xs font-bold uppercase tracking-widest ${activeTheme.textMutedClass || "text-zinc-500"} mt-8`}>
          {isEs ? "¿No tienes cuenta?" : "Don't have an account?"}{" "}
          <Link href={`/${lang}/auth/register`} className={`text-[var(--accent)] font-black hover:underline`}>
            {isEs ? "Regístrate" : "Register"}
          </Link>
        </p>
      </div>
    </div>
  );
}
