import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface BentoCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  icon?: LucideIcon;
}

export function BentoCard({ children, className = "", title, icon: Icon }: BentoCardProps) {
  return (
    <article className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      {title && (
        <header className="mb-4 flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-slate-400" />}
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">
            {title}
          </h3>
        </header>
      )}
      {children}
    </article>
  );
}
