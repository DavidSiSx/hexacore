"use client";

import { useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { UserPlus, Mail, Lock, User, AlertTriangle, CheckCircle } from "lucide-react";
import { useTheme } from "@/app/components/Shared/ThemeProvider";

export default function RegisterPage() {
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const { activeTheme } = useTheme();

  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isEs = lang === "es";

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = getSupabaseClient();
    if (!supabase) {
      setError(isEs ? "Error de conexión. Intenta más tarde." : "Connection error. Try again later.");
      setLoading(false);
      return;
    }

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
        <div className={`w-full max-w-md border-4 ${activeTheme.borderClass} ${activeTheme.cardBgClass || "bg-zinc-950"} p-8 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]`}>
          <div className={`w-16 h-16 mx-auto mb-6 border-4 ${activeTheme.borderClass} flex items-center justify-center`}>
            <CheckCircle className={`w-8 h-8 ${activeTheme.accentClass}`} strokeWidth={3} />
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tighter text-[var(--foreground)] mb-4">
            {isEs ? "Revisa tu correo" : "Check your email"}
          </h2>
          <p className={`${activeTheme.textMutedClass || "text-zinc-400"} text-sm font-bold uppercase leading-relaxed mb-6`}>
            {isEs ? (
              <>
                Te hemos enviado un link de confirmación a{" "}
                <span className="text-[var(--accent)]">{email}</span>. Haz clic en él para activar tu cuenta.
              </>
            ) : (
              <>
                We sent a confirmation link to{" "}
                <span className="text-[var(--accent)]">{email}</span>. Click on it to activate your account.
              </>
            )}
          </p>
          <Link
            href={`/${lang}/auth/login`}
            className={`inline-block border-4 ${activeTheme.borderClass} px-6 py-3 
                       text-xs font-black uppercase tracking-widest text-[var(--foreground)]
                       hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] hover:border-[var(--accent)]
                       active:scale-95 transition-none cursor-pointer`}
          >
            {isEs ? "Ir al Login" : "Go to Login"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16 bg-[var(--background)]">
      <div className={`w-full max-w-md border-4 ${activeTheme.borderClass} ${activeTheme.cardBgClass || "bg-zinc-950"} p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]`}>
        {/* Header */}
        <div className={`text-center mb-8 border-b-4 ${activeTheme.borderClass} pb-6`}>
          <h1 className={`text-4xl font-black uppercase tracking-tighter ${activeTheme.accentClass} mb-2`}>
            {isEs ? "Crear Cuenta" : "Register"}
          </h1>
          <p className={`${activeTheme.textMutedClass || "text-zinc-400"} text-[10px] font-black uppercase tracking-widest`}>
            {isEs ? "Únete y construye equipos con IA" : "Join us and build teams with AI"}
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
            <label className={`text-[10px] font-black uppercase tracking-widest ${activeTheme.textMutedClass || "text-zinc-500"} flex items-center gap-2`}>
              <User className="w-3.5 h-3.5" strokeWidth={3} /> {isEs ? "Nombre de Entrenador" : "Trainer Name"}
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              className={`w-full bg-[var(--background)] border-4 ${activeTheme.borderClass} px-4 py-3
                         text-sm text-[var(--foreground)] font-bold
                         focus:outline-none focus:border-[var(--accent)] transition-none`}
              placeholder="Ash"
            />
          </div>

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
              minLength={6}
              className={`w-full bg-[var(--background)] border-4 ${activeTheme.borderClass} px-4 py-3
                         text-sm text-[var(--foreground)] font-bold
                         focus:outline-none focus:border-[var(--accent)] transition-none`}
              placeholder={isEs ? "Mínimo 6 caracteres" : "Min 6 characters"}
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
            <UserPlus className="w-5 h-5" strokeWidth={3} />
            {loading ? (isEs ? "Creando..." : "Creating...") : (isEs ? "Crear Cuenta" : "Create Account")}
          </button>
        </form>

        {/* Login Link */}
        <p className={`text-center text-xs font-bold uppercase tracking-widest ${activeTheme.textMutedClass || "text-zinc-500"} mt-8`}>
          {isEs ? "¿Ya tienes cuenta?" : "Already have an account?"}{" "}
          <Link href={`/${lang}/auth/login`} className={`text-[var(--accent)] font-black hover:underline`}>
            {isEs ? "Inicia sesión" : "Log In"}
          </Link>
        </p>
      </div>
    </div>
  );
}
