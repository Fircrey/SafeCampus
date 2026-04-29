"use client";

import {
  AlertTriangle,
  Bot,
  Camera,
  CheckCircle2,
  ClipboardList,
  HeartHandshake,
  Loader2,
  MapPin,
  MessageCircle,
  Route,
  Send,
  ShieldCheck,
  Upload
} from "lucide-react";
import { FormEvent, useMemo, useRef, useState } from "react";
import type { ChatMessage, Detection } from "@/lib/types";

const quickPrompts = [
  "Necesito hablar con alguien, me siento sobrepasado.",
  "¿Qué ruta tiene Utadeo para acoso o discriminación?",
  "Explícame cómo reportar una amenaza sin exponerme.",
  "¿Qué dice el reglamento sobre faltas disciplinarias?"
];

const reportQuestions = [
  "Quiero reportar una situación insegura. ¿Qué ocurrió?",
  "¿En qué lugar del campus o alrededores pasó?",
  "¿Hay riesgo inmediato para alguien en este momento?",
  "¿Quieres dejar datos de contacto o prefieres reporte confidencial/anónimo?"
];

export function SafeCampusApp() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hola, soy SafeCampus AI. Puedo acompañarte con bienestar emocional, convivencia o reportes de seguridad. Si hay riesgo inmediato, llama al 123 y contacta seguridad institucional."
    }
  ]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [reportMode, setReportMode] = useState(false);
  const [reportStep, setReportStep] = useState(0);
  const [reportDraft, setReportDraft] = useState<string[]>([]);

  const [image, setImage] = useState<string | null>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [detectMode, setDetectMode] = useState<string>("");
  const [detectLoading, setDetectLoading] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 1, height: 1 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const riskLevel = useMemo(() => {
    const max = Math.max(0, ...detections.map((item) => item.confidence));
    if (max > 0.8) return { label: "R3", text: "Verificación humana inmediata" };
    if (max > 0.55) return { label: "R2", text: "Revisar con operador" };
    return { label: "R1", text: "Monitoreo preventivo" };
  }, [detections]);

  async function sendMessage(custom?: string) {
    const content = (custom ?? input).trim();
    if (!content || chatLoading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setInput("");
    setChatLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages })
      });
      const data = await response.json();
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content:
            data.reply ||
            "No pude responder ahora. Si es urgente, contacta el 123 o seguridad institucional."
        }
      ]);
    } catch {
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content:
            "Hubo un problema de conexión. Si hay peligro inmediato, usa canales humanos: 123, seguridad o bienestar institucional."
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  }

  function submitChat(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage();
  }

  function startReport() {
    setReportMode(true);
    setReportStep(0);
    setReportDraft([]);
    setMessages((current) => [
      ...current,
      { role: "assistant", content: reportQuestions[0] }
    ]);
  }

  function handleReportAnswer() {
    const answer = input.trim();
    if (!answer) return;

    const nextDraft = [...reportDraft, answer];
    const nextStep = reportStep + 1;
    setMessages((current) => [
      ...current,
      { role: "user", content: answer },
      {
        role: "assistant",
        content:
          nextStep < reportQuestions.length
            ? reportQuestions[nextStep]
            : buildReportSummary(nextDraft)
      }
    ]);
    setReportDraft(nextDraft);
    setReportStep(nextStep);
    setInput("");
    if (nextStep >= reportQuestions.length) setReportMode(false);
  }

  function buildReportSummary(values: string[]) {
    return `Reporte preliminar creado para revisión humana.\n\nTipo de situación: ${values[0]}\nLugar: ${values[1]}\nRiesgo inmediato: ${values[2]}\nContacto/confidencialidad: ${values[3]}\n\nSi hay riesgo actual, llama al 123 y contacta seguridad institucional. Este demo no envía el reporte a una autoridad real.`;
  }

  function onFileSelected(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
      setDetections([]);
      setDetectMode("");
    };
    reader.readAsDataURL(file);
  }

  async function runDetection() {
    if (!image) return;
    setDetectLoading(true);
    try {
      const response = await fetch("/api/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image })
      });
      const data = await response.json();
      setDetections(data.detections || []);
      setDetectMode(data.mode || "");
    } finally {
      setDetectLoading(false);
    }
  }

  return (
    <main className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center bg-tadeo-blue text-white">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-tadeo-blue">
                Utadeo demo
              </p>
              <h1 className="text-xl font-black text-tadeo-ink">SafeCampus AI</h1>
            </div>
          </div>
          <div className="hidden items-center gap-2 text-sm font-semibold text-tadeo-blue sm:flex">
            <span className="h-3 w-3 bg-tadeo-yellow" />
            IA alerta, humanos deciden
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <div className="space-y-6">
          <section className="overflow-hidden bg-tadeo-blue text-white shadow-panel">
            <div className="grid gap-6 p-6 lg:grid-cols-[1fr_280px]">
              <div>
                <p className="mb-3 inline-flex items-center gap-2 bg-tadeo-yellow px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-tadeo-blue">
                  Centro de monitoreo
                </p>
                <h2 className="max-w-2xl text-3xl font-black leading-tight sm:text-5xl">
                  Seguridad, convivencia y bienestar con IA responsable.
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-blue-50 sm:text-base">
                  Demo desplegable en Vercel con detector de armas visibles vía Roboflow,
                  chatbot de apoyo emocional con OpenAI y reporte guiado para situaciones
                  inseguras.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-tadeo-ink">
                <Metric label="Alertas activas" value="04" />
                <Metric label="Tiempo medio" value="2.8m" />
                <Metric label="Derivaciones" value="12" />
                <Metric label="Modelo" value="YOLOv8" />
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            <StatusCard
              icon={<Camera />}
              title="Visión"
              text="Detección de armas visibles con validación humana."
            />
            <StatusCard
              icon={<HeartHandshake />}
              title="Bienestar"
              text="Chat de apoyo, contención y derivación institucional."
            />
            <StatusCard
              icon={<Route />}
              title="Convivencia"
              text="Rutas para buen trato, acoso, amenazas y disciplina."
            />
          </section>

          <section className="bg-white p-5 shadow-panel">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-tadeo-blue">
                  Demo Roboflow
                </p>
                <h2 className="text-2xl font-black text-tadeo-ink">
                  Detector de armas visibles
                </h2>
              </div>
              <button
                className="focus-ring inline-flex items-center gap-2 bg-tadeo-blue px-4 py-2 text-sm font-bold text-white"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4" />
                Subir imagen
              </button>
              <input
                ref={fileInputRef}
                className="hidden"
                type="file"
                accept="image/*"
                onChange={(event) => onFileSelected(event.target.files?.[0])}
              />
            </div>

            <div className="grid gap-5 lg:grid-cols-[1fr_260px]">
              <div className="relative flex min-h-[360px] items-center justify-center overflow-hidden border border-slate-200 bg-slate-100">
                {image ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image}
                      alt="Imagen para detección"
                      className="max-h-[520px] w-full object-contain"
                      onLoad={(event) =>
                        setImageSize({
                          width: event.currentTarget.naturalWidth,
                          height: event.currentTarget.naturalHeight
                        })
                      }
                    />
                    <DetectionOverlay detections={detections} imageSize={imageSize} />
                  </>
                ) : (
                  <div className="px-6 text-center">
                    <Camera className="mx-auto mb-3 h-12 w-12 text-tadeo-blue" />
                    <p className="font-bold text-tadeo-ink">
                      Sube una imagen para probar el detector.
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      Sin API key de Roboflow se muestra una respuesta simulada para el
                      flujo de demo.
                    </p>
                  </div>
                )}
              </div>

              <aside className="space-y-3">
                <button
                  className="focus-ring flex w-full items-center justify-center gap-2 bg-tadeo-yellow px-4 py-3 font-black text-tadeo-blue disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={!image || detectLoading}
                  onClick={runDetection}
                >
                  {detectLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <ShieldCheck className="h-5 w-5" />
                  )}
                  Analizar
                </button>
                <div className="border border-slate-200 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                    Nivel contextual
                  </p>
                  <p className="mt-2 text-3xl font-black text-tadeo-blue">
                    {riskLevel.label}
                  </p>
                  <p className="text-sm text-slate-600">{riskLevel.text}</p>
                </div>
                <div className="border border-slate-200 p-4">
                  <p className="mb-3 text-sm font-black text-tadeo-ink">
                    Detecciones {detectMode ? `(${detectMode})` : ""}
                  </p>
                  <div className="space-y-2">
                    {detections.length ? (
                      detections.map((item, index) => (
                        <div
                          key={`${item.class}-${index}`}
                          className="flex items-center justify-between border-l-4 border-tadeo-yellow bg-slate-50 px-3 py-2 text-sm"
                        >
                          <span className="font-bold">{item.class}</span>
                          <span>{Math.round(item.confidence * 100)}%</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">
                        Aún no hay resultados.
                      </p>
                    )}
                  </div>
                </div>
              </aside>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="bg-white shadow-panel">
            <div className="border-b border-slate-200 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center bg-tadeo-blue text-white">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-tadeo-blue">
                    Chat de bienestar
                  </p>
                  <h2 className="text-xl font-black text-tadeo-ink">
                    Orientación y reporte
                  </h2>
                </div>
              </div>
            </div>

            <div className="h-[500px] space-y-3 overflow-y-auto p-5">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`max-w-[88%] whitespace-pre-line px-4 py-3 text-sm leading-6 ${
                    message.role === "assistant"
                      ? "bg-slate-100 text-tadeo-ink"
                      : "ml-auto bg-tadeo-blue text-white"
                  }`}
                >
                  {message.content}
                </div>
              ))}
              {chatLoading && (
                <div className="inline-flex items-center gap-2 bg-slate-100 px-4 py-3 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Escribiendo
                </div>
              )}
            </div>

            <div className="space-y-3 border-t border-slate-200 p-5">
              <div className="flex flex-wrap gap-2">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    className="focus-ring border border-slate-200 px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:border-tadeo-blue"
                    onClick={() => void sendMessage(prompt)}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
              <form className="flex gap-2" onSubmit={submitChat}>
                <textarea
                  className="focus-ring min-h-[52px] flex-1 resize-none border border-slate-300 px-3 py-3 text-sm"
                  placeholder={
                    reportMode
                      ? "Responde la pregunta del reporte..."
                      : "Escribe aquí..."
                  }
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                />
                <button
                  className="focus-ring flex w-12 items-center justify-center bg-tadeo-blue text-white"
                  type={reportMode ? "button" : "submit"}
                  onClick={reportMode ? handleReportAnswer : undefined}
                  aria-label="Enviar"
                >
                  <Send className="h-5 w-5" />
                </button>
              </form>
              <button
                className="focus-ring flex w-full items-center justify-center gap-2 bg-tadeo-yellow px-4 py-3 font-black text-tadeo-blue"
                onClick={startReport}
              >
                <MessageCircle className="h-5 w-5" />
                Reportar situación insegura
              </button>
            </div>
          </section>

          <section className="bg-white p-5 shadow-panel">
            <h2 className="mb-4 text-xl font-black text-tadeo-ink">
              Rutas institucionales
            </h2>
            <div className="space-y-3">
              <RouteItem
                icon={<HeartHandshake />}
                title="Bienestar Universitario"
                text="Apoyo emocional, orientación y derivación. Ext. 3940."
              />
              <RouteItem
                icon={<ClipboardList />}
                title="Reglamento y disciplina"
                text="Reglamento de Pregrado vigente: Acuerdo 015 de julio 7 de 2021."
              />
              <RouteItem
                icon={<AlertTriangle />}
                title="Acoso, discriminación y violencia sexual"
                text="Resolución 020 y ruta de atención de Bienestar Universitario."
              />
              <RouteItem
                icon={<MapPin />}
                title="Emergencia"
                text="Riesgo inmediato: línea 123 y seguridad institucional."
              />
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-black text-tadeo-blue">{value}</p>
    </div>
  );
}

function StatusCard({
  icon,
  title,
  text
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <article className="border border-slate-200 bg-white p-5 shadow-panel">
      <div className="mb-4 flex h-10 w-10 items-center justify-center bg-tadeo-blue text-white">
        {icon}
      </div>
      <h3 className="font-black text-tadeo-ink">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </article>
  );
}

function RouteItem({
  icon,
  title,
  text
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-3 border border-slate-200 p-3">
      <div className="mt-1 text-tadeo-blue">{icon}</div>
      <div>
        <p className="font-black text-tadeo-ink">{title}</p>
        <p className="text-sm leading-6 text-slate-600">{text}</p>
      </div>
    </div>
  );
}

function DetectionOverlay({
  detections,
  imageSize
}: {
  detections: Detection[];
  imageSize: { width: number; height: number };
}) {
  return (
    <div className="pointer-events-none absolute inset-0">
      {detections.map((item, index) => {
        const left = ((item.x - item.width / 2) / imageSize.width) * 100;
        const top = ((item.y - item.height / 2) / imageSize.height) * 100;
        const width = (item.width / imageSize.width) * 100;
        const height = (item.height / imageSize.height) * 100;

        return (
          <div
            key={`${item.class}-box-${index}`}
            className="absolute border-2 border-tadeo-yellow"
            style={{ left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%` }}
          >
            <span className="absolute -top-7 left-0 bg-tadeo-yellow px-2 py-1 text-xs font-black text-tadeo-blue">
              {item.class} {Math.round(item.confidence * 100)}%
            </span>
          </div>
        );
      })}
    </div>
  );
}
