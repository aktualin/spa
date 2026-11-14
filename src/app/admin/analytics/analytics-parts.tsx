export const number = new Intl.NumberFormat("id-ID");
export const decimal = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 });

export function Metric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-xl border border-neutral-200/80 bg-white px-4 py-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-neutral-900">
        {value}
      </p>
      <p className="mt-1 text-[11px] text-neutral-400">{detail}</p>
    </div>
  );
}

export function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-neutral-200/80 bg-white p-4 sm:p-5">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-xs font-semibold text-neutral-700">{title}</h2>
        <span className="text-[11px] tabular-nums text-neutral-400">
          {subtitle}
        </span>
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}