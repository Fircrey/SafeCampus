"use client";

import { Send } from "lucide-react";
import type { FormEvent } from "react";

interface ChatInputProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onReportAnswer?: () => void;
  reportMode: boolean;
  disabled: boolean;
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  onReportAnswer,
  reportMode,
  disabled
}: ChatInputProps) {
  const handleSubmit = reportMode
    ? (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onReportAnswer?.();
      }
    : onSubmit;

  return (
    <form className="flex gap-2" onSubmit={handleSubmit}>
      <textarea
        className="focus-ring min-h-[52px] flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-colors focus:border-tadeo-cyan focus:bg-white"
        placeholder={reportMode ? "Responde la pregunta del reporte..." : "Escribe aquí..."}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (reportMode) {
              onReportAnswer?.();
            } else {
              e.currentTarget.form?.requestSubmit();
            }
          }
        }}
        disabled={disabled}
      />
      <button
        className="focus-ring flex w-12 items-center justify-center rounded-xl bg-tadeo-blue text-white shadow-sm transition-all hover:bg-tadeo-blueDark hover:shadow-md active:scale-95 disabled:opacity-60"
        type="submit"
        disabled={disabled}
        aria-label="Enviar"
      >
        <Send className="h-5 w-5" />
      </button>
    </form>
  );
}
