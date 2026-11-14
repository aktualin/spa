import Link from "next/link";

import { TRAFFIC_PERIOD_DAYS } from "@/lib/domain/traffic";

/** Judul halaman analitik + pemilih periode (7/30/90 hari). */
export function AnalyticsHeader({ days }: { days: number }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
          Analitik
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-900">
          Pengunjung &amp; Halaman
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-neutral-500">
          Halaman publik yang dibuka pengunjung. Tanpa IP atau User-Agent —
          pengunjung unik dihitung dari ID acak di cookie.
        </p>
      </div>
      <nav aria-label="Periode" className="flex items-center gap-1 rounded-lg border border-neutral-200 bg-white p-1">
        {TRAFFIC_PERIOD_DAYS.map((period) => (
          <Link
            key={period}
            href={period === 30 ? "/admin/analytics" : `/admin/analytics?days=${period}`}
            aria-current={days === period ? "page" : undefined}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
              days === period
                ? "bg-cocoa text-white"
                : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
            }`}
          >
            {period} hari
          </Link>
        ))}
      </nav>
    </header>
  );
}