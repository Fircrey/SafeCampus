"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/lib/types";

interface ChatMessagesProps {
  messages: ChatMessage[];
  loading: boolean;
}

export function ChatMessages({ messages, loading }: ChatMessagesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    if (distanceFromBottom < 120) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  return (
    <div ref={containerRef} className="h-[480px] space-y-3 overflow-y-auto p-5">
      {messages.map((msg, i) => (
        <div
          key={msg.id ?? `${msg.role}-${i}`}
          className={`max-w-[88%] whitespace-pre-line px-4 py-3 text-sm leading-6 ${
            msg.role === "assistant"
              ? "bg-slate-100 text-tadeo-ink"
              : "ml-auto bg-tadeo-blue text-white"
          }`}
        >
          {msg.content}
        </div>
      ))}
      {loading && (
        <div className="inline-flex items-center gap-2 bg-slate-100 px-4 py-3 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Escribiendo
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
