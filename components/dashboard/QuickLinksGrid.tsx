import Link from "next/link";
import { Bot, HelpCircle, Map, MapPin } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface QuickLink {
  href: string;
  icon: LucideIcon;
  label: string;
  description: string;
  accent: string;
}

const LINKS: QuickLink[] = [
  {
    href: "/ayuda",
    icon: HelpCircle,
    label: "Centro de Ayuda",
    description: "Bienestar emocional, reportes guiados y orientación.",
    accent: "bg-tadeo-blue",
  },
  {
    href: "/chat",
    icon: Bot,
    label: "Chat de Bienestar",
    description: "Apoyo emocional, convivencia y reportes guiados.",
    accent: "bg-tadeo-sky",
  },
  {
    href: "/mapa",
    icon: Map,
    label: "Mapa del Campus",
    description: "Reporta y visualiza incidentes por zona.",
    accent: "bg-tadeo-yellow",
  },
  {
    href: "/rutas",
    icon: MapPin,
    label: "Rutas Institucionales",
    description: "Protocolos, reglamento y contactos de emergencia.",
    accent: "bg-tadeo-green",
  },
];

export function QuickLinksGrid({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500">
        Acceso rápido
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {LINKS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex flex-col gap-3 rounded-lg border border-slate-100 bg-slate-50 p-4 transition-all hover:border-slate-200 hover:bg-white hover:shadow-md"
          >
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full text-white ${item.accent}`}
            >
              <item.icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-tadeo-ink group-hover:text-tadeo-blue">
                {item.label}
              </p>
              <p className="mt-0.5 text-[11px] leading-snug text-slate-500">
                {item.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
