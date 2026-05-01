import type { ReactNode } from "react";

interface Phone {
  label: string;
  number: string;
}

interface RouteItemProps {
  icon: ReactNode;
  title: string;
  text: string;
  phones?: Phone[];
}

export function RouteItem({ icon, title, text, phones }: RouteItemProps) {
  return (
    <div className="flex gap-3 border border-slate-200 p-4">
      <div className="mt-1 shrink-0 text-tadeo-blue">{icon}</div>
      <div>
        <p className="font-black text-tadeo-ink">{title}</p>
        <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
        {phones && phones.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {phones.map((p) => (
              <a
                key={p.number}
                href={`tel:${p.number}`}
                className="inline-flex items-center gap-1 rounded bg-tadeo-blue/10 px-2 py-0.5 text-xs font-bold text-tadeo-blue hover:bg-tadeo-blue/20"
              >
                📞 {p.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
