import { AlertTriangle, Bot } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Centro de Ayuda · SafeCampus AI"
};

export default function AyudaHub() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="mb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-tadeo-blue">
            SafeCampus AI
          </p>
          <h1 className="mt-1 text-2xl font-black text-tadeo-ink">
            Centro de Ayuda
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Elige cómo podemos ayudarte hoy
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Chat de Bienestar */}
          <Link
            href="/ayuda/bienestar"
            className="group flex flex-col items-center gap-4 border border-slate-200 bg-white p-8 shadow-panel transition-shadow hover:shadow-lg"
          >
            <div className="flex h-14 w-14 items-center justify-center bg-tadeo-blue text-white transition-transform group-hover:scale-110">
              <Bot className="h-7 w-7" />
            </div>
            <div className="text-center">
              <h2 className="text-lg font-black text-tadeo-ink">
                Chat de Bienestar
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Habla con nuestra IA sobre bienestar emocional, convivencia o
                dudas
              </p>
            </div>
          </Link>

          {/* Reportar Situación */}
          <Link
            href="/ayuda/reportar"
            className="group flex flex-col items-center gap-4 border border-slate-200 bg-white p-8 shadow-panel transition-shadow hover:shadow-lg"
          >
            <div className="flex h-14 w-14 items-center justify-center bg-tadeo-yellow text-tadeo-blue transition-transform group-hover:scale-110">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <div className="text-center">
              <h2 className="text-lg font-black text-tadeo-ink">
                Reportar Situación
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Reporta una situación insegura de forma guiada y confidencial
              </p>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
