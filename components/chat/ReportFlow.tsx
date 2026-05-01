import { MessageCircle } from "lucide-react";

interface ReportFlowProps {
  onStart: () => void;
}

export function ReportFlow({ onStart }: ReportFlowProps) {
  return (
    <button
      className="focus-ring flex w-full items-center justify-center gap-2 bg-tadeo-yellow px-4 py-3 font-black text-tadeo-blue"
      onClick={onStart}
    >
      <MessageCircle className="h-5 w-5" />
      Reportar situación insegura
    </button>
  );
}
