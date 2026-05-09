"use client";

import { useEffect, useRef } from "react";
import { User } from "lucide-react";
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
    <div ref={containerRef} className="h-[min(480px,50vh)] min-h-[250px] space-y-3 overflow-y-auto p-5">
      {messages.map((msg, i) => (
        <div
          key={msg.id ?? `${msg.role}-${i}`}
          className={`msg-enter flex items-start gap-2.5 ${
            msg.role === "user" ? "justify-end" : ""
          }`}
        >
          {msg.role === "assistant" && (
            <img
              src="/mascot-chat.png"
              alt="Cabito"
              width={36}
              height={36}
              className="mt-1 shrink-0 rounded-full shadow-sm"
            />
          )}
          <div
            className={`max-w-[82%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-6 ${
              msg.role === "assistant"
                ? "bg-slate-100 text-tadeo-ink"
                : "bg-tadeo-blue text-white"
            }`}
          >
            {msg.content}
          </div>
          {msg.role === "user" && (
            <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-tadeo-cyan/15 text-tadeo-cyanDark">
              <User className="h-4 w-4" />
            </div>
          )}
        </div>
      ))}
      {loading && (
        <div className="msg-enter flex items-start gap-2.5">
          <img
            src="/mascot-chat.png"
            alt="Cabito"
            width={36}
            height={36}
            className="mt-1 shrink-0 rounded-full shadow-sm"
          />
          <div className="flex items-center gap-1.5 rounded-2xl bg-slate-100 px-4 py-3.5">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
