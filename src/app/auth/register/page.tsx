"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import { UserPlus, Mail, Lock, User, AlertTriangle, CheckCircle } from "lucide-react";

export default function RegisterPage() {
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
      <div className="flex flex-1 items-center justify-center px-4 py-16 bg-[var(--background)]">
        <div className="w-full max-w-md border-4 border-[var(--accent)] bg-[var(--surface-2)] p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-6 border-4 border-[var(--accent)] flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-[var(--accent)]" strokeWidth={3} />
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tighter text-[var(--foreground)] mb-4">
            Revisa tu correo
          </h2>
          <p className="text-[var(--text-muted)] text-sm font-bold uppercase leading-relaxed mb-6">
            Te hemos enviado un link de confirmacion a{" "}
            <span className="text-[var(--accent)]">{email}</span>.
            Haz clic en el para activar tu cuenta.
          </p>
          <Link
            href="/auth/login"
            className="inline-block border-4 border-[var(--border)] px-6 py-3 
                       text-xs font-black uppercase tracking-widest text-[var(--foreground)]
                       hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] hover:border-[var(--accent)]
                       active:scale-95 transition-none"
          >
            Ir al Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16 bg-[var(--background)]">
      <div className="w-full max-w-md border-4 border-[var(--border)] bg-[var(--surface-2)] p-8">
        {/* Header */}
        <div className="text-center mb-8 border-b-4 border-[var(--border)] pb-6">
          <h1 className="text-4xl font-black uppercase tracking-tighter text-[var(--accent)] mb-2">
            Crear Cuenta
          </h1>
          <p className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-widest">
            Unete y construye equipos con IA
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
        <form onSubmit={handleRegister} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-2">
              <User className="w-3 h-3" strokeWidth={3} /> Nombre de Entrenador
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              className="w-full bg-[var(--background)] border-4 border-[var(--border)] px-4 py-3
                         text-sm text-[var(--foreground)] font-bold
                         focus:outline-none focus:border-[var(--accent)] transition-none"
              placeholder="Ash"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-2">
              <Mail className="w-3 h-3" strokeWidth={3} /> Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[var(--background)] border-4 border-[var(--border)] px-4 py-3
                         text-sm text-[var(--foreground)] font-bold
                         focus:outline-none focus:border-[var(--accent)] transition-none"
              placeholder="tu@email.com"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-2">
              <Lock className="w-3 h-3" strokeWidth={3} /> Contrasena
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-[var(--background)] border-4 border-[var(--border)] px-4 py-3
                         text-sm text-[var(--foreground)] font-bold
                         focus:outline-none focus:border-[var(--accent)] transition-none"
              placeholder="Minimo 6 caracteres"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--accent)] text-[var(--accent-foreground)] border-4 border-[var(--accent)]
                       font-black uppercase tracking-tighter text-lg py-4
                       hover:bg-[var(--foreground)] hover:text-[var(--background)] hover:border-[var(--foreground)]
                       disabled:opacity-40 disabled:pointer-events-none
                       active:scale-95 transition-none flex items-center justify-center gap-2"
          >
            <UserPlus className="w-5 h-5" strokeWidth={3} />
            {loading ? "Creando..." : "Crear Cuenta"}
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mt-8">
          Ya tienes cuenta?{" "}
          <Link href="/auth/login" className="text-[var(--accent)] hover:underline">
            Inicia sesion
          </Link>
        </p>
      </div>
    </div>
  );
}
