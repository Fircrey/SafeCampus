"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2">
          <img
            src="/cabito-icon.png"
            alt="Cabito"
            className="max-h-32 max-w-32 rounded-xl object-contain sm:max-h-60 sm:max-w-60"
          />
          <h1 className="text-2xl font-black text-tadeo-ink">SafeCampus AI</h1>
          <p className="text-sm text-slate-500">Crea tu cuenta</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl bg-white p-6 shadow-panel">
          {error && (
            <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-slate-700">
              Nombre completo
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-tadeo-blue focus:outline-none focus:ring-1 focus:ring-tadeo-blue"
              placeholder="Juan Pérez"
            />
          </div>
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
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="focus-ring w-full rounded bg-tadeo-blue py-2.5 text-sm font-bold text-white transition hover:bg-tadeo-blueDark disabled:opacity-50"
          >
            {loading ? "Registrando..." : "Crear Cuenta"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-semibold text-tadeo-blue hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
