import Link from "next/link";
import {
  Bot,
  Camera,
  MapPin,
  Zap
} from "lucide-react";
import { MetricCard } from "@/components/shared/MetricCard";
import { StatusCard } from "@/components/shared/StatusCard";

const quickLinks = [
  {
    href: "/detector",
    icon: Camera,
    label: "Detector en Vivo",
    description: "Feed YOLO en tiempo real desde webcam.",
    accent: "bg-cctv-red"
  },
  {
    href: "/chat",
    icon: Bot,
    label: "Chat de Bienestar",
    description: "Apoyo emocional, convivencia y reportes guiados.",
    accent: "bg-tadeo-sky"
  },
  {
    href: "/rutas",
    icon: MapPin,
    label: "Rutas Institucionales",
    description: "Protocolos, reglamento y contactos de emergencia.",
    accent: "bg-tadeo-green"
  }
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="overflow-hidden bg-tadeo-blue text-white">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="mb-3 inline-flex items-center gap-2 bg-tadeo-yellow px-3 py-1 text-xs font-black uppercase tracking-widest text-tadeo-blue">
                <Zap className="h-3 w-3" />
                Centro de monitoreo
              </p>
              <h1 className="text-4xl font-black leading-tight sm:text-5xl">
                Seguridad, convivencia y<br />bienestar con IA responsable.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100">
                Plataforma unificada para campus universitario: detección de armas en tiempo real,
                chatbot de apoyo emocional y rutas institucionales.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 self-center">
              <MetricCard label="Alertas activas" value="04" />
              <MetricCard label="Tiempo medio" value="2.8m" />
              <MetricCard label="Derivaciones" value="12" />
              <MetricCard label="Modelo" value="YOLOv8" />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        {/* Status cards */}
        <section className="mb-10 grid gap-4 md:grid-cols-3">
          <StatusCard
            icon={<Camera />}
            title="Visión"
            text="Detección de armas visibles con validación humana."
          />
          <StatusCard
            icon={<Bot />}
            title="Bienestar"
            text="Chat de apoyo, contención y derivación institucional."
          />
          <StatusCard
            icon={<MapPin />}
            title="Convivencia"
            text="Rutas para buen trato, acoso, amenazas y disciplina."
          />
        </section>

        {/* Quick links */}
        <section>
          <h2 className="mb-4 text-xl font-black text-tadeo-ink">Acceso rápido</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quickLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex flex-col gap-3 border border-slate-200 bg-white p-5 shadow-panel transition-shadow hover:shadow-lg"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center text-white ${item.accent}`}
                >
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-black text-tadeo-ink group-hover:text-tadeo-blue">
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">{item.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Legal notice */}
        <p className="mt-10 text-center text-xs text-slate-400">
          IA alerta, humanos deciden · Sistema académico demo · Universidad Jorge Tadeo Lozano
        </p>
      </div>
    </main>
  );
}
