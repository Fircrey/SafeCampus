"use client";

import { Moon, Settings, Sun, Type } from "lucide-react";
import { useTheme } from "@/components/theme/ThemeContext";
import { AppInfo } from "@/components/ajustes/AppInfo";

type FontSize = "small" | "normal" | "large";

const FONT_OPTIONS: { value: FontSize; label: string; size: string }[] = [
  { value: "small", label: "Pequena", size: "text-xs" },
  { value: "normal", label: "Normal", size: "text-sm" },
  { value: "large", label: "Grande", size: "text-lg" },
];

export default function AjustesPage() {
  const { theme, fontSize, toggleTheme, setFontSize } = useTheme();

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-2xl px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-1 flex items-center gap-2">
            <Settings className="h-5 w-5 text-tadeo-blue" />
            <p className="text-xs font-bold uppercase tracking-widest text-tadeo-blue">
              Configuracion
            </p>
          </div>
          <h1 className="text-2xl font-black text-tadeo-ink">SafeCampus AI</h1>
        </div>

        <div className="stagger-fade-in space-y-6">
          {/* Apariencia */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-panel">
            <h2 className="mb-6 text-xs font-bold uppercase tracking-widest text-slate-400">
              Apariencia
            </h2>

            {/* Dark mode toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {theme === "dark" ? (
                  <Moon className="h-5 w-5 text-tadeo-blue" />
                ) : (
                  <Sun className="h-5 w-5 text-yellow-500" />
                )}
                <div>
                  <p className="text-sm font-semibold text-tadeo-ink">
                    Modo oscuro
                  </p>
                  <p className="text-xs text-slate-500">
                    Ajusta el tema visual de la aplicacion
                  </p>
                </div>
              </div>

              {/* Toggle switch */}
              <button
                onClick={toggleTheme}
                role="switch"
                aria-checked={theme === "dark"}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ${
                  theme === "dark" ? "bg-tadeo-blue" : "bg-slate-300"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
                    theme === "dark" ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Divider */}
            <hr className="my-6 border-slate-200" />

            {/* Font size selector */}
            <div>
              <div className="mb-3 flex items-center gap-3">
                <Type className="h-5 w-5 text-tadeo-blue" />
                <div>
                  <p className="text-sm font-semibold text-tadeo-ink">
                    Tamano de fuente
                  </p>
                  <p className="text-xs text-slate-500">
                    Ajusta el tamano del texto en toda la aplicacion
                  </p>
                </div>
              </div>

              <div className="mt-3 flex gap-3">
                {FONT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setFontSize(opt.value)}
                    className={`flex flex-1 flex-col items-center gap-1 rounded-xl border-2 px-4 py-3 transition-all ${
                      fontSize === opt.value
                        ? "border-tadeo-blue bg-tadeo-blue/5 text-tadeo-blue"
                        : "border-slate-200 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    <span className={`font-bold ${opt.size}`}>Aa</span>
                    <span className="text-[10px] font-medium uppercase tracking-wider">
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Acerca de */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-panel">
            <h2 className="mb-6 text-xs font-bold uppercase tracking-widest text-slate-400">
              Acerca de
            </h2>
            <AppInfo />
          </section>
        </div>
      </div>
    </main>
  );
}
