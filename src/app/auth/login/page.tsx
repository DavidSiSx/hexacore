"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    router.push("/builder");
  }

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/builder` },
    });
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="glass-card w-full max-w-sm p-8">
        <h1 className="text-2xl font-bold text-center mb-1">
          <span className="bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]
                          bg-clip-text text-transparent">
            Iniciar Sesión
          </span>
        </h1>
        <p className="text-[var(--text-muted)] text-sm text-center mb-6">
          Accede a tu cuenta para construir equipos
        </p>

        {error && (
          <div className="bg-[var(--danger)]/10 border border-[var(--danger)]/30 rounded-lg p-3 mb-4">
            <p className="text-[var(--danger)] text-xs">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-[var(--text-muted)] mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-4 py-2.5
                         text-sm text-white outline-none focus:border-[var(--accent-primary)] transition-colors"
              placeholder="tu@email.com"
            />
          </div>
          <div>
            <label className="text-xs text-[var(--text-muted)] mb-1 block">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-4 py-2.5
                         text-sm text-white outline-none focus:border-[var(--accent-primary)] transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)]
                       disabled:opacity-40 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-[var(--border)]" />
          <span className="text-[var(--text-muted)] text-xs">o</span>
          <div className="flex-1 h-px bg-[var(--border)]" />
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-2 border border-[var(--border)]
                     hover:border-[var(--border-active)] text-[var(--text-secondary)] text-sm 
                     py-2.5 rounded-xl transition-colors hover:bg-white/5"
        >
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continuar con Google
        </button>

        <p className="text-center text-xs text-[var(--text-muted)] mt-5">
          ¿No tienes cuenta?{" "}
          <Link href="/auth/register" className="text-[var(--accent-primary)] hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}
