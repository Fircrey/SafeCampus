"use client";

import { Bot } from "lucide-react";
import { FormEvent, useState } from "react";
import type { ChatMessage } from "@/lib/types";
import { createReport } from "@/lib/flask-client";
import { ChatInput } from "./ChatInput";
import { ChatMessages } from "./ChatMessages";
import { QuickPrompts } from "./QuickPrompts";
import { ReportFlow } from "./ReportFlow";

const REPORT_QUESTIONS = [
  "Quiero reportar una situación insegura. ¿Qué ocurrió?",
  "¿En qué lugar del campus o alrededores pasó?",
  "¿Hay riesgo inmediato para alguien en este momento?",
  "¿Quieres dejar datos de contacto o prefieres reporte confidencial/anónimo?"
];

function buildSummary(values: string[], saved: boolean) {
  const base = `Reporte preliminar ${saved ? "guardado" : "creado"} para revisión humana.\n\nTipo de situación: ${values[0]}\nLugar: ${values[1]}\nRiesgo inmediato: ${values[2]}\nContacto/confidencialidad: ${values[3]}`;
  if (saved) {
    return base + "\n\nTu reporte ha sido registrado y será revisado por el equipo de seguridad.";
  }
  return base + "\n\nSi hay riesgo actual, llama al 123 y contacta seguridad institucional. No se pudo guardar el reporte automáticamente.";
}

export function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hola, soy SafeCampus AI. Puedo acompañarte con bienestar emocional, convivencia o reportes de seguridad. Si hay riesgo inmediato, llama al 123 y contacta seguridad institucional."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [reportMode, setReportMode] = useState(false);
  const [reportStep, setReportStep] = useState(0);
  const [reportDraft, setReportDraft] = useState<string[]>([]);

  async function sendMessage(custom?: string) {
    const content = (custom ?? input).trim();
    if (!content || loading) return;

    const next: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setMessages([
        ...next,
        {
          role: "assistant",
          content:
            data.reply ||
            "No pude responder ahora. Si es urgente, contacta el 123 o seguridad institucional."
        }
      ]);
    } catch {
      setMessages([
        ...next,
        {
          role: "assistant",
          content:
            "Hubo un problema de conexión. Si hay peligro inmediato, usa canales humanos: 123, seguridad o bienestar institucional."
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  function submitChat(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    void sendMessage();
  }

  function startReport() {
    setReportMode(true);
    setReportStep(0);
    setReportDraft([]);
    setMessages((prev) => [...prev, { role: "assistant", content: REPORT_QUESTIONS[0] }]);
  }

  async function handleReportAnswer() {
    const answer = input.trim();
    if (!answer) return;
    const nextDraft = [...reportDraft, answer];
    const nextStep = reportStep + 1;

    setMessages((prev) => [...prev, { role: "user", content: answer }]);
    setReportDraft(nextDraft);
    setReportStep(nextStep);
    setInput("");

    if (nextStep < REPORT_QUESTIONS.length) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: REPORT_QUESTIONS[nextStep] }
      ]);
    } else {
      // Final step: save to backend
      setReportMode(false);
      const isAnonymous = nextDraft[3].toLowerCase().includes("anónim") || nextDraft[3].toLowerCase().includes("confidencial");
      let saved = false;
      try {
        await createReport({
          type_description: nextDraft[0],
          location: nextDraft[1],
          immediate_risk: nextDraft[2],
          contact_preference: nextDraft[3],
          is_anonymous: isAnonymous,
        });
        saved = true;
      } catch (err) { console.error("[ChatPage] Error guardando reporte:", err); }
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: buildSummary(nextDraft, saved) }
      ]);
    }
  }

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-3xl px-6 py-8">
        <div className="overflow-hidden rounded-2xl bg-white shadow-panel">
          {/* Header */}
          <div className="border-b border-slate-200 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-tadeo-blue text-white">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-tadeo-cyan">
                  Chat de bienestar
                </p>
                <h1 className="text-xl font-black text-tadeo-ink">Orientación y reporte</h1>
              </div>
            </div>
          </div>

          {/* Messages */}
          <ChatMessages messages={messages} loading={loading} />

          {/* Controls */}
          <div className="space-y-3 border-t border-slate-200 p-5">
            {reportMode && (
              <p className="text-center text-xs font-semibold text-tadeo-blue">
                Paso {reportStep + 1} de {REPORT_QUESTIONS.length} — Reporte guiado
              </p>
            )}
            {messages.length <= 1 && <QuickPrompts onSelect={(p) => void sendMessage(p)} />}
            <ChatInput
              value={input}
              onChange={setInput}
              onSubmit={submitChat}
              onReportAnswer={handleReportAnswer}
              reportMode={reportMode}
              disabled={loading}
            />
            {!reportMode && <ReportFlow onStart={startReport} disabled={loading} />}
          </div>
        </div>
      </div>
    </main>
  );
}
