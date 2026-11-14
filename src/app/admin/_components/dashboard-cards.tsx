import Link from "next/link";

import type { DashboardAlert } from "@/lib/domain/admin-dashboard";

export function AlertList({ alerts }: { alerts: DashboardAlert[] }) {
  if (alerts.length === 0) {
    return (
      <p className="mt-3 rounded-xl border border-neutral-200/80 bg-white px-4 py-3 text-sm text-neutral-500">
        Tidak ada yang perlu ditindaklanjuti. Semua bagian situs sudah terisi,
        tidak ada inquiry baru, dan tidak ada promo yang segera berakhir.
      </p>
    );
  }

  return (
    <ul className="mt-3 space-y-2">
      {alerts.map((alert) => (
        <li key={alert.id}>
          <Link
            href={alert.href}
            className={`flex items-start gap-3 rounded-xl border px-4 py-3 transition ${
              alert.tone === "attention"
                ? "border-amber-200 bg-amber-50/60 hover:border-amber-300"
                : "border-neutral-200/80 bg-white hover:border-neutral-300"
            }`}
          >
            <span
              aria-hidden
              className={`mt-1.5 size-1.5 shrink-0 rounded-full ${
                alert.tone === "attention" ? "bg-amber-500" : "bg-neutral-300"
              }`}
            />
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-medium text-neutral-900">
                {alert.label}
              </span>
              <span className="mt-0.5 block text-xs leading-relaxed text-neutral-500">
                {alert.detail}
              </span>
            </span>
            {alert.count === undefined ? null : (
              <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold tabular-nums text-neutral-700 ring-1 ring-neutral-200">
                {alert.count}
              </span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-neutral-200/80 bg-white px-4 py-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-neutral-900">
        {value}
      </p>
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
        <h3 className="text-xs font-semibold text-neutral-700">{title}</h3>
        <span className="text-[11px] tabular-nums text-neutral-400">
          {subtitle}
        </span>
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}