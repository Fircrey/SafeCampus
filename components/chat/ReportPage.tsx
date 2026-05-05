"use client";

import { AlertTriangle, Camera, X } from "lucide-react";
import { FormEvent, useRef, useState } from "react";
import type { ChatMessage } from "@/lib/types";
import { createReportWithPhoto } from "@/lib/flask-client";
import { ChatInput } from "./ChatInput";
import { ChatMessages } from "./ChatMessages";

type StepType = "text" | "choice" | "file";

interface ReportStep {
  question: string;
  type: StepType;
  options?: string[];
}

const STEPS: ReportStep[] = [
  { question: "¿Qué ocurrió? Describe brevemente la situación.", type: "text" },
  { question: "¿En qué lugar del campus o alrededores pasó?", type: "text" },
  { question: "¿Hay riesgo inmediato para alguien en este momento?", type: "choice", options: ["Sí", "No"] },
  { question: "¿Cómo quieres enviar el reporte?", type: "choice", options: ["Anónimo", "Con datos de contacto"] },
  { question: "¿Quieres enviar una foto como evidencia?", type: "choice", options: ["Sí", "No"] },
];

function buildSummary(values: string[], saved: boolean) {
  const base = `Reporte preliminar ${saved ? "guardado" : "creado"} para revisión humana.\n\nTipo de situación: ${values[0]}\nLugar: ${values[1]}\nRiesgo inmediato: ${values[2]}\nContacto/confidencialidad: ${values[3]}`;
  if (saved) {
    return base + "\n\nTu reporte ha sido registrado y será revisado por el equipo de seguridad.";
  }
  return base + "\n\nSi hay riesgo actual, llama al 123 y contacta seguridad institucional. No se pudo guardar el reporte automáticamente.";
}

export function ReportPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Vamos a registrar tu reporte de forma guiada. Toda la información es confidencial.\n\nSi hay riesgo inmediato, llama al 123 y contacta seguridad institucional.",
    },
    {
      role: "assistant",
      content: STEPS[0].question,
    },
  ]);
  const [input, setInput] = useState("");
  const [reportStep, setReportStep] = useState(0);
  const [reportDraft, setReportDraft] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [waitingForContact, setWaitingForContact] = useState(false);
  const [waitingForPhoto, setWaitingForPhoto] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalSteps = STEPS.length;

  async function submitReport(draft: string[], photoFile: File | null) {
    setSubmitting(true);
    const isAnonymous = draft[3].toLowerCase().includes("anónim") || draft[3].toLowerCase().includes("anonimo");
    let saved = false;
    try {
      await createReportWithPhoto(
        {
          type_description: draft[0],
          location: draft[1],
          immediate_risk: draft[2],
          contact_preference: draft[3],
          is_anonymous: isAnonymous,
        },
        photoFile
      );
      saved = true;
    } catch (err) {
      console.error("[ReportPage] Error guardando reporte:", err);
    }
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: buildSummary(draft, saved) },
    ]);
    setFinished(true);
    setSubmitting(false);
  }

  function advanceStep(answer: string) {
    const nextDraft = [...reportDraft, answer];
    const nextStep = reportStep + 1;

    setMessages((prev) => [...prev, { role: "user", content: answer }]);
    setReportDraft(nextDraft);
    setReportStep(nextStep);
    setInput("");

    // After step 4 (index 3): if "Con datos de contacto" ask for contact info
    if (reportStep === 3 && answer.toLowerCase().includes("contacto")) {
      setWaitingForContact(true);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Escribe tu información de contacto (nombre, teléfono o email):" },
      ]);
      return;
    }

    // After step 5 (index 4): if "Sí" show photo upload
    if (reportStep === 4 && answer.toLowerCase() === "sí") {
      setWaitingForPhoto(true);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Selecciona una imagen desde tu dispositivo:" },
      ]);
      return;
    }

    // If we have all steps, submit
    if (nextStep >= totalSteps) {
      void submitReport(nextDraft, photo);
      return;
    }

    // Show next question
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: STEPS[nextStep].question },
    ]);
  }

  function handleChoiceClick(option: string) {
    advanceStep(option);
  }

  function handleContactSubmit() {
    const answer = input.trim();
    if (!answer) return;
    // Replace the last draft entry (which was "Con datos de contacto") with the contact info appended
    const updatedDraft = [...reportDraft];
    updatedDraft[updatedDraft.length - 1] = `Con datos de contacto: ${answer}`;
    setReportDraft(updatedDraft);
    setMessages((prev) => [...prev, { role: "user", content: answer }]);
    setInput("");
    setWaitingForContact(false);

    // Show step 5
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: STEPS[4].question },
    ]);
  }

  function handlePhotoSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    const url = URL.createObjectURL(file);
    setPhotoPreview(url);
  }

  function handlePhotoConfirm() {
    setWaitingForPhoto(false);
    setMessages((prev) => [
      ...prev,
      { role: "user", content: `📷 Foto adjunta: ${photo?.name}` },
    ]);
    void submitReport(reportDraft, photo);
  }

  function handlePhotoRemove() {
    setPhoto(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleTextAnswer() {
    const answer = input.trim();
    if (!answer) return;
    advanceStep(answer);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (waitingForContact) {
      handleContactSubmit();
    } else {
      handleTextAnswer();
    }
  }

  const currentStep = STEPS[reportStep];
  const showTextInput =
    !finished &&
    !waitingForPhoto &&
    (waitingForContact || (currentStep && currentStep.type === "text"));
  const showChoiceButtons =
    !finished && !waitingForContact && !waitingForPhoto && currentStep && currentStep.type === "choice";

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-3xl px-6 py-8">
        <div className="overflow-hidden bg-white shadow-panel">
          {/* Header */}
          <div className="border-b border-slate-200 p-5">
            <div className="flex items-center gap-3">
              <img
                src="/mascot-chat.png"
                alt="Cabito"
                width={48}
                height={48}
                className="rounded-full"
              />
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-tadeo-blue">
                  Reporte guiado
                </p>
                <h1 className="text-xl font-black text-tadeo-ink">
                  Reportar situación insegura
                </h1>
              </div>
            </div>
          </div>

          {/* Messages */}
          <ChatMessages messages={messages} loading={submitting} />

          {/* Controls */}
          <div className="space-y-3 border-t border-slate-200 p-5">
            {!finished && (
              <p className="text-center text-xs font-semibold text-tadeo-blue">
                Paso {Math.min(reportStep + 1, totalSteps)} de {totalSteps} — Reporte guiado
              </p>
            )}

            {/* Choice buttons */}
            {showChoiceButtons && currentStep.options && (
              <div className="flex justify-center gap-3">
                {currentStep.options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleChoiceClick(option)}
                    className="rounded-lg border-2 border-tadeo-blue bg-white px-6 py-3 text-sm font-bold text-tadeo-blue transition-all hover:bg-tadeo-blue hover:text-white active:scale-95"
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            {/* Text input */}
            {showTextInput && (
              <ChatInput
                value={input}
                onChange={setInput}
                onSubmit={handleSubmit}
                reportMode={true}
                onReportAnswer={waitingForContact ? handleContactSubmit : handleTextAnswer}
                disabled={false}
              />
            )}

            {/* Photo upload */}
            {waitingForPhoto && (
              <div className="space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoSelected}
                  className="hidden"
                />

                {!photoPreview && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mx-auto flex items-center gap-2 rounded-lg border-2 border-dashed border-slate-300 px-6 py-4 text-sm text-slate-600 transition-colors hover:border-tadeo-blue hover:text-tadeo-blue"
                  >
                    <Camera className="h-5 w-5" />
                    Seleccionar imagen
                  </button>
                )}

                {photoPreview && (
                  <div className="space-y-3">
                    <div className="relative mx-auto w-fit">
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="max-h-48 rounded-lg border border-slate-200"
                      />
                      <button
                        type="button"
                        onClick={handlePhotoRemove}
                        className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white shadow-md hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="flex justify-center gap-3">
                      <button
                        type="button"
                        onClick={handlePhotoConfirm}
                        className="rounded-lg bg-tadeo-blue px-6 py-2 text-sm font-bold text-white transition-all hover:bg-tadeo-blue/90 active:scale-95"
                      >
                        Enviar reporte con foto
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handlePhotoRemove();
                          setWaitingForPhoto(false);
                          setMessages((prev) => [
                            ...prev,
                            { role: "user", content: "Sin foto" },
                          ]);
                          void submitReport(reportDraft, null);
                        }}
                        className="rounded-lg border border-slate-300 px-6 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 active:scale-95"
                      >
                        Enviar sin foto
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {finished && (
              <p className="text-center text-sm text-slate-500">
                Reporte completado. Puedes cerrar esta página.
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
