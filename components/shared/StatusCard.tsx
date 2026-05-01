interface StatusCardProps {
  icon: React.ReactNode;
  title: string;
  text: string;
}

export function StatusCard({ icon, title, text }: StatusCardProps) {
  return (
    <article className="border border-slate-200 bg-white p-5 shadow-panel">
      <div className="mb-4 flex h-10 w-10 items-center justify-center bg-tadeo-blue text-white">
        {icon}
      </div>
      <h3 className="font-black text-tadeo-ink">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </article>
  );
}
