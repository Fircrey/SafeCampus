import { MessageCircle } from "lucide-react";

interface ReportFlowProps {
  onStart: () => void;
  disabled?: boolean;
}

export function ReportFlow({ onStart, disabled }: ReportFlowProps) {
  return (
    <button
      className="focus-ring flex w-full items-center justify-center gap-2 rounded-xl bg-tadeo-cyan px-4 py-3 font-black text-white shadow-sm transition-all hover:bg-tadeo-cyanDark hover:shadow-md active:scale-[0.98] disabled:opacity-60"
      onClick={onStart}
      disabled={disabled}
    >
      <MessageCircle className="h-5 w-5" />
      Reportar situación insegura
    </button>
  );
}
