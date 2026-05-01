import { AlertTriangle, ClipboardList, HeartHandshake, MapPin, Phone, Shield } from "lucide-react";
import { RouteItem } from "./RouteItem";

const ROUTES = [
  {
    icon: <HeartHandshake className="h-5 w-5" />,
    title: "Bienestar Universitario",
    text: "Apoyo emocional, orientación psicológica y derivación institucional. Línea directa: ext. 3940 · 6012427030."
  },
  {
    icon: <ClipboardList className="h-5 w-5" />,
    title: "Reglamento y disciplina",
    text: "Reglamento de Pregrado vigente: Acuerdo 015 de julio 7 de 2021. Consulta el proceso ante Comité Disciplinario."
  },
  {
    icon: <AlertTriangle className="h-5 w-5" />,
    title: "Acoso y discriminación",
    text: "Resolución 020: ruta de atención para acoso sexual, por razones de género o discriminación. Reporta en Bienestar."
  },
  {
    icon: <Shield className="h-5 w-5" />,
    title: "Violencia y amenazas",
    text: "Resolución 028: protocolo de prevención de violencia. Contacta seguridad institucional de inmediato si hay riesgo."
  },
  {
    icon: <MapPin className="h-5 w-5" />,
    title: "Emergencia inmediata",
    text: "Riesgo de vida: llama al 123 (Policía / Emergencias). Luego comunica a seguridad del campus."
  },
  {
    icon: <Phone className="h-5 w-5" />,
    title: "Línea de crisis emocional",
    text: "Línea 106 (Ministerio de Salud, gratuita). Disponible 24/7 para crisis emocional o ideación suicida."
  }
];

export function RutasPage() {
  return (
    <main className="min-h-screen">
      <div className="border-b border-slate-200 bg-white px-6 py-5">
        <p className="text-xs font-bold uppercase tracking-widest text-tadeo-blue">
          Utadeo · Protocolos
        </p>
        <h1 className="text-2xl font-black text-tadeo-ink">Rutas Institucionales</h1>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-8">
        <p className="mb-6 text-sm leading-7 text-slate-600">
          Vías formales para gestionar situaciones de inseguridad, malestar emocional, acoso o
          conflictos disciplinarios en el campus. Recuerda: ante riesgo inmediato, llama al{" "}
          <strong>123</strong>.
        </p>

        <div className="space-y-3">
          {ROUTES.map((route) => (
            <RouteItem key={route.title} icon={route.icon} title={route.title} text={route.text} />
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">
          Información basada en normativa vigente de UTADEO · Verificar actualizaciones en{" "}
          bienestar universitario
        </p>
      </div>
    </main>
  );
}
