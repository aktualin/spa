import { requireRole } from "@/lib/auth";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { parseTrafficPeriod } from "@/lib/domain/traffic";

import { TrendArea, TrendBars } from "../_components/dashboard-charts";
import { loadAnalyticsData } from "./analytics-data";
import { AnalyticsHeader } from "./analytics-header";
import { ChartCard, Metric, decimal, number } from "./analytics-parts";
import { TopPagesSection } from "./analytics-top-pages";

export const instant = false;

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  await requireRole(CONTENT_ROLES);

  const params = await searchParams;
  const days = parseTrafficPeriod(params.days);
  const {
    visitorTrend,
    viewTrend,
    uniqueVisitors,
    views,
    distinctPaths,
    averageViews,
    topPages,
    loadError,
  } = await loadAnalyticsData(days);

  return (
    <div className="mx-auto max-w-6xl">
      <AnalyticsHeader days={days} />

      {loadError ? (
        <p
          role="alert"
          className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          Data pengunjung tidak dapat dimuat karena kesalahan database. Coba
          muat ulang halaman beberapa saat lagi.
        </p>
      ) : null}

      <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Pengunjung unik" value={number.format(uniqueVisitors)} detail={`${days} hari terakhir`} />
        <Metric label="Tampilan halaman" value={number.format(views)} detail="Semua halaman publik" />
        <Metric
          label="Rata-rata per pengunjung"
          value={decimal.format(averageViews)}
          detail="Halaman dibuka"
        />
        <Metric
          label="Halaman berbeda"
          value={number.format(distinctPaths)}
          detail="URL yang pernah dibuka"
        />
      </section>

      <section className="mt-4 grid gap-3 lg:grid-cols-2">
        <ChartCard
          title="Pengunjung unik per hari"
          subtitle={`${number.format(uniqueVisitors)} pengunjung unik · ${days} hari`}
        >
          <TrendArea
            points={visitorTrend}
            label="Pengunjung unik per hari"
            suffix=" pengunjung"
          />
        </ChartCard>
        <ChartCard
          title="Tampilan halaman per hari"
          subtitle={`${number.format(views)} tampilan · ${days} hari`}
        >
          <TrendBars
            points={viewTrend}
            label="Tampilan halaman per hari"
            suffix=" tampilan"
          />
        </ChartCard>
      </section>

      <TopPagesSection topPages={topPages} views={views} days={days} />

      <p className="mt-6 rounded-xl border border-neutral-200/80 bg-white px-4 py-3 text-[11px] leading-relaxed text-neutral-500">
        Yang tidak dihitung: halaman <code>/admin</code>, API, aset, bot/crawler,
        dan prefetch tautan. Pengunjung yang menghapus cookie akan dihitung
        sebagai pengunjung baru. Data dihitung dengan kalender WIB (UTC+7).
      </p>
    </div>
  );
}