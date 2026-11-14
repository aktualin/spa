import Link from "next/link";

import type { TrendPoint } from "@/lib/domain/admin-dashboard";

import { StatCard, ChartCard } from "./_components/dashboard-cards";
import { TrendArea, TrendBars } from "./_components/dashboard-charts";
import type { TrafficSummary } from "./page.traffic";

export function VisitorsSection({
  traffic,
  visitorTrend,
  viewTrend,
  averageViews,
  numberFormat,
  trafficError,
}: {
  traffic: TrafficSummary["traffic"];
  visitorTrend: TrendPoint[];
  viewTrend: TrendPoint[];
  averageViews: number;
  numberFormat: Intl.NumberFormat;
  trafficError: boolean;
}) {
  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-neutral-900">Pengunjung</h2>
          <p className="mt-0.5 text-xs text-neutral-400">
            30 hari terakhir · waktu Jakarta
          </p>
        </div>
        <Link
          href="/admin/analytics"
          className="text-xs font-medium text-cocoa underline-offset-2 hover:underline"
        >
          Detail halaman →
        </Link>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <StatCard label="Pengunjung unik" value={traffic.uniqueVisitors} />
        <StatCard label="Tampilan halaman" value={traffic.totalViews} />
        <StatCard label="Pengunjung hari ini" value={traffic.visitorsToday} />
      </div>
      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        <ChartCard
          title="Pengunjung unik per hari"
          subtitle={`${traffic.uniqueVisitors} pengunjung unik`}
        >
          <TrendArea
            points={visitorTrend}
            label="Pengunjung unik per hari"
            suffix=" pengunjung"
          />
        </ChartCard>
        <ChartCard
          title="Tampilan halaman per hari"
          subtitle={`${traffic.totalViews} tampilan`}
        >
          <TrendBars
            points={viewTrend}
            label="Tampilan halaman per hari"
            suffix=" tampilan"
          />
        </ChartCard>
        <div className="rounded-xl border border-neutral-200/80 bg-white p-4 sm:p-5">
          <h3 className="text-xs font-semibold text-neutral-700">
            Cara menghitung
          </h3>
          <ul className="mt-2 space-y-1.5 text-[11px] leading-relaxed text-neutral-500">
            <li>
              Pengunjung unik memakai ID acak di cookie, bukan alamat IP.
            </li>
            <li>
              Admin, API, aset, bot, dan prefetch tidak ikut dihitung.
            </li>
            <li>
              Rata-rata {numberFormat.format(averageViews)} halaman dibuka per
              pengunjung pada periode ini.
            </li>
          </ul>
          <Link
            href="/admin/analytics"
            className="mt-3 inline-block text-[11px] font-medium text-cocoa underline-offset-2 hover:underline"
          >
            Lihat halaman terpopuler →
          </Link>
        </div>
      </div>
      {trafficError ? (
        <p className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Data pengunjung tidak dapat dimuat karena kesalahan database. Angka
          di atas ditampilkan sebagai nol.
        </p>
      ) : null}
    </section>
  );
}