"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nombre, avatar_url: null },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="glass-card w-full max-w-sm p-8 text-center animate-fade-in">
          <div className="text-4xl mb-4">✉️</div>
          <h2 className="text-xl font-bold text-white mb-2">Revisa tu correo</h2>
          <p className="text-[var(--text-muted)] text-sm">
            Te hemos enviado un link de confirmación a <strong className="text-white">{email}</strong>.
            Haz clic en él para activar tu cuenta.
          </p>
          <Link
            href="/auth/login"
            className="inline-block mt-6 text-[var(--accent-primary)] text-sm hover:underline"
          >
            Ir al Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="glass-card w-full max-w-sm p-8">
        <h1 className="text-2xl font-bold text-center mb-1">
          <span className="bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]
                          bg-clip-text text-transparent">
            Crear Cuenta
          </span>
        </h1>
        <p className="text-[var(--text-muted)] text-sm text-center mb-6">
          Únete y empieza a construir equipos con IA
        </p>

        {error && (
          <div className="bg-[var(--danger)]/10 border border-[var(--danger)]/30 rounded-lg p-3 mb-4">
            <p className="text-[var(--danger)] text-xs">{error}</p>
          </div>
        )}

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-[var(--text-muted)] mb-1 block">Nombre de Entrenador</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-4 py-2.5
                         text-sm text-white outline-none focus:border-[var(--accent-primary)] transition-colors"
              placeholder="Ash"
            />
          </div>
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
              minLength={6}
              className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-4 py-2.5
                         text-sm text-white outline-none focus:border-[var(--accent-primary)] transition-colors"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)]
                       disabled:opacity-40 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors"
          >
            {loading ? "Creando..." : "Crear Cuenta"}
          </button>
        </form>

        <p className="text-center text-xs text-[var(--text-muted)] mt-5">
          ¿Ya tienes cuenta?{" "}
          <Link href="/auth/login" className="text-[var(--accent-primary)] hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
