interface MetricCardProps {
  label: string;
  value: string | number;
  dark?: boolean;
}

export function MetricCard({ label, value, dark = false }: MetricCardProps) {
  if (dark) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{label}</p>
        <p className="mt-2 text-2xl font-black text-tadeo-blue">{value}</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-black text-tadeo-blue">{value}</p>
    </div>
  );
}
