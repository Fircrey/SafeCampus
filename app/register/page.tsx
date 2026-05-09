"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(email, name, password);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrarse");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-tadeo-blue via-tadeo-blueDark to-[#0A1628]" />
      <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-tadeo-cyan/20 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-tadeo-cyan/10 blur-3xl" />

      {/* Card */}
      <div className="page-transition relative z-10 w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2">
          <img
            src="/cabito-icon.png"
            alt="Cabito"
            className="max-h-28 max-w-28 rounded-2xl object-contain drop-shadow-lg sm:max-h-48 sm:max-w-48"
          />
          <h1 className="text-2xl font-black text-white">SafeCampus AI</h1>
          <p className="text-sm text-slate-300">Crea tu cuenta</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-white/20 bg-white/10 p-6 shadow-card-elevated backdrop-blur-xl"
        >
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-500/20 px-3 py-2 text-sm text-red-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-slate-200">
              Nombre completo
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white placeholder-slate-400 backdrop-blur-sm transition focus:border-tadeo-cyan focus:outline-none focus:ring-2 focus:ring-tadeo-cyan/50"
              placeholder="Juan Pérez"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-slate-200">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white placeholder-slate-400 backdrop-blur-sm transition focus:border-tadeo-cyan focus:outline-none focus:ring-2 focus:ring-tadeo-cyan/50"
              placeholder="usuario@utadeo.edu.co"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-slate-200">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white placeholder-slate-400 backdrop-blur-sm transition focus:border-tadeo-cyan focus:outline-none focus:ring-2 focus:ring-tadeo-cyan/50"
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="focus-ring flex w-full items-center justify-center gap-2 rounded-lg bg-tadeo-cyan py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-tadeo-cyanDark hover:shadow-md disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Registrando...
              </>
            ) : (
              "Crear Cuenta"
            )}
          </button>
        </form>

        <p className="text-center text-sm text-slate-300">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-semibold text-tadeo-cyan hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
