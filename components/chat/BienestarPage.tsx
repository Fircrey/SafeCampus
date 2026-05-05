"use client";

import { FormEvent, useState } from "react";
import type { ChatMessage } from "@/lib/types";
import { ChatInput } from "./ChatInput";
import { ChatMessages } from "./ChatMessages";
import { QuickPrompts } from "./QuickPrompts";

export function BienestarPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hola, soy SafeCampus AI. Puedo acompañarte con bienestar emocional, convivencia o dudas. Si hay riesgo inmediato, llama al 123 y contacta seguridad institucional."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

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

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-3xl px-6 py-8">
        <div className="overflow-hidden bg-white shadow-panel">
          {/* Header */}
          <div className="border-b border-slate-200 p-5">
            <a href="/ayuda" className="mb-2 inline-block text-xs text-slate-400 hover:text-tadeo-blue">
              &larr; Centro de Ayuda
            </a>
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
                  Chat de bienestar
                </p>
                <h1 className="text-xl font-black text-tadeo-ink">
                  Orientación emocional
                </h1>
              </div>
            </div>
          </div>

          {/* Messages */}
          <ChatMessages messages={messages} loading={loading} />

          {/* Controls */}
          <div className="space-y-3 border-t border-slate-200 p-5">
            {messages.length <= 1 && <QuickPrompts onSelect={(p) => void sendMessage(p)} />}
            <ChatInput
              value={input}
              onChange={setInput}
              onSubmit={submitChat}
              reportMode={false}
              disabled={loading}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
