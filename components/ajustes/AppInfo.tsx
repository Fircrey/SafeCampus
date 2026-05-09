"use client";

const STACK_BADGES = [
  { label: "Next.js 16", color: "bg-black text-white" },
  { label: "React 19", color: "bg-sky-500 text-white" },
  { label: "TypeScript", color: "bg-blue-600 text-white" },
  { label: "Tailwind CSS", color: "bg-cyan-500 text-white" },
  { label: "Flask", color: "bg-gray-700 text-white" },
  { label: "YOLOv8", color: "bg-purple-600 text-white" },
  { label: "OpenCV", color: "bg-green-600 text-white" },
  { label: "Socket.IO", color: "bg-yellow-500 text-black" },
];

export function AppInfo() {
  return (
    <div className="space-y-6">
      {/* Version */}
      <div className="flex items-baseline gap-3">
        <span className="text-xl font-black text-tadeo-ink">SafeCampus AI</span>
        <span className="rounded-full bg-tadeo-blue/10 px-3 py-0.5 text-xs font-bold text-tadeo-blue">
          v0.1.0
        </span>
      </div>

      {/* Description */}
      <p className="text-sm leading-relaxed text-slate-600">
        Sistema inteligente de seguridad, convivencia y bienestar para el campus
        universitario. Combina deteccion de armas en tiempo real, chatbot de
        bienestar y reportes discretos.
      </p>

      {/* Stack badges */}
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-400">
          Tecnologias
        </p>
        <div className="flex flex-wrap gap-2">
          {STACK_BADGES.map((badge) => (
            <span
              key={badge.label}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${badge.color}`}
            >
              {badge.label}
            </span>
          ))}
        </div>
      </div>

      {/* Divider */}
      <hr className="border-slate-200" />

      {/* Signature */}
      <div className="text-center">
        <p className="text-xs text-slate-400">Desarrollado por</p>
        <p className="mt-1 text-lg font-black tracking-tight text-tadeo-blue">
          MagnorTech
        </p>
        <p className="mt-0.5 text-xs text-slate-500">
          Universidad Jorge Tadeo Lozano
        </p>
        <p className="text-xs text-slate-400">2026</p>
      </div>
    </div>
  );
}
