"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center bg-tadeo-blue">
            <ShieldCheck className="h-6 w-6 text-tadeo-yellow" />
          </div>
          <h1 className="text-2xl font-black text-tadeo-ink">SafeCampus AI</h1>
          <p className="text-sm text-slate-500">Inicia sesión para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 shadow-panel">
          {error && (
            <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-tadeo-blue focus:outline-none focus:ring-1 focus:ring-tadeo-blue"
              placeholder="usuario@utadeo.edu.co"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-tadeo-blue focus:outline-none focus:ring-1 focus:ring-tadeo-blue"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-tadeo-blue py-2.5 text-sm font-bold text-white transition hover:bg-tadeo-blueDark disabled:opacity-50"
          >
            {loading ? "Ingresando..." : "Iniciar Sesión"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="font-semibold text-tadeo-blue hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </main>
  );
}
