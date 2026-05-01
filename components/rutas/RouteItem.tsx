interface RouteItemProps {
  icon: React.ReactNode;
  title: string;
  text: string;
}

export function RouteItem({ icon, title, text }: RouteItemProps) {
  return (
    <div className="flex gap-3 border border-slate-200 p-4">
      <div className="mt-1 shrink-0 text-tadeo-blue">{icon}</div>
      <div>
        <p className="font-black text-tadeo-ink">{title}</p>
        <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
      </div>
    </div>
  );
}
