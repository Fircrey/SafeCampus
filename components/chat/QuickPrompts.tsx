const QUICK_PROMPTS = [
  "Necesito hablar con alguien, me siento sobrepasado.",
  "¿Qué ruta tiene Utadeo para acoso o discriminación?",
  "Explícame cómo reportar una amenaza sin exponerme.",
  "¿Qué dice el reglamento sobre faltas disciplinarias?"
];

interface QuickPromptsProps {
  onSelect: (prompt: string) => void;
}

export function QuickPrompts({ onSelect }: QuickPromptsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {QUICK_PROMPTS.map((prompt) => (
        <button
          key={prompt}
          onClick={() => onSelect(prompt)}
          className="focus-ring border border-slate-200 px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:border-tadeo-blue"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}
