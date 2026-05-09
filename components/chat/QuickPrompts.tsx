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
    <div className="stagger-fade-in flex flex-wrap gap-2">
      {QUICK_PROMPTS.map((prompt) => (
        <button
          key={prompt}
          onClick={() => onSelect(prompt)}
          className="focus-ring rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs font-semibold text-slate-700 transition-all hover:border-tadeo-cyan hover:bg-tadeo-cyanLight hover:text-tadeo-cyanDark"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}
