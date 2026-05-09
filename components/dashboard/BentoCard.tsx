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
    <article className={`rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 ${className}`}>
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
