import { NextResponse } from "next/server";
import { assistantInstructions } from "@/lib/protocols";

export const runtime = "edge";

type IncomingMessage = {
  role: "assistant" | "user";
  content: string;
};

export async function POST(request: Request) {
  const { messages } = (await request.json()) as { messages?: IncomingMessage[] };
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  if (!messages?.length) {
    return NextResponse.json({ error: "Faltan mensajes." }, { status: 400 });
  }

  if (!apiKey) {
    return NextResponse.json({
      reply:
        "Estoy en modo demo porque falta OPENAI_API_KEY. Puedo orientarte: si hay riesgo inmediato llama al 123 o contacta seguridad institucional. Si quieres, cuéntame si necesitas apoyo emocional, orientación sobre convivencia o registrar una situación insegura."
    });
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      temperature: 0.35,
      messages: [
        { role: "developer", content: assistantInstructions },
        ...messages.slice(-12)
      ]
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    return NextResponse.json(
      { error: "No fue posible consultar OpenAI.", detail },
      { status: 502 }
    );
  }

  const data = await response.json();
  const reply =
    data?.choices?.[0]?.message?.content ||
    "No pude generar una respuesta. Intenta de nuevo.";

  return NextResponse.json({ reply });
}
