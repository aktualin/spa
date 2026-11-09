import Link from "next/link";

import { getTopPages, getTrafficOverview, type TopPage } from "@/lib/analytics/report";
import { requireRole } from "@/lib/auth";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import {
  averagePagesPerVisitor,
  dailyTrafficSeries,
  dayBuckets,
  pageViewShare,
  parseTrafficPeriod,
  TRAFFIC_PERIOD_DAYS,
} from "@/lib/domain/traffic";

import { TrendArea, TrendBars } from "../_components/dashboard-charts";

export const instant = false;

const number = new Intl.NumberFormat("id-ID");
const decimal = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 });

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  await requireRole(CONTENT_ROLES);

  const params = await searchParams;
  const days = parseTrafficPeriod(params.days);
  const now = new Date();

  let overview: Awaited<ReturnType<typeof getTrafficOverview>> | null = null;
  let topPages: TopPage[] = [];
  let loadError = false;

  try {
    [overview, topPages] = await Promise.all([
      getTrafficOverview(now, days),
      getTopPages(now, days, 50),
    ]);
  } catch {
    loadError = true;
  }

  const buckets = overview?.buckets ?? dayBuckets(now, days);
  const visitorTrend = dailyTrafficSeries(
    overview?.daily ?? [],
    buckets,
    "visitors",
  );
  const viewTrend = dailyTrafficSeries(overview?.daily ?? [], buckets, "views");
  const uniqueVisitors = overview?.uniqueVisitors ?? 0;
  const views = overview?.totalViews ?? 0;
  const distinctPaths = overview?.distinctPaths ?? 0;
  const averageViews = averagePagesPerVisitor(views, uniqueVisitors);
  const busiestPage = topPages[0]?.views ?? 0;

  return (
    <div className="mx-auto max-w-6xl">
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

      <section className="mt-8">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-neutral-900">
              Halaman terpopuler
            </h2>
            <p className="mt-0.5 text-xs text-neutral-400">
              {days} hari terakhir · diurutkan dari tampilan terbanyak
            </p>
          </div>
          <p className="text-[11px] tabular-nums text-neutral-400">
            {number.format(topPages.length)} halaman
          </p>
        </div>

        {topPages.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-neutral-200 bg-white px-4 py-8 text-center text-sm text-neutral-400">
            Belum ada kunjungan pada periode ini. Data mulai terkumpul setelah
            fitur analitik aktif dan ada pengunjung membuka situs.
          </p>
        ) : (
          <div className="mt-3 overflow-hidden rounded-xl border border-neutral-200/80 bg-white">
            <div className="flex items-center gap-3 border-b border-neutral-100 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400 sm:px-5">
              <span className="w-5 text-right">#</span>
              <span className="min-w-0 flex-1">Halaman</span>
              <span className="shrink-0 text-right">Tampilan</span>
            </div>
            <ul className="divide-y divide-neutral-100">
              {topPages.map((page, index) => {
                const share = pageViewShare(page.views, views);
                const percent =
                  share === 0
                    ? "0%"
                    : share < 0.01
                      ? "<1%"
                      : `${Math.round(share * 100)}%`;
                const barWidth =
                  busiestPage > 0 ? (page.views / busiestPage) * 100 : 0;

                return (
                  <li
                    key={page.path}
                    className="grid grid-cols-[1.25rem_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-5"
                  >
                    <span className="text-right text-[11px] tabular-nums text-neutral-400">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <Link
                        href={page.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={page.path}
                        className="block truncate text-[13px] font-medium text-neutral-800 underline-offset-2 hover:text-cocoa hover:underline"
                      >
                        {page.path === "/" ? "Beranda" : page.path}
                      </Link>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-neutral-100">
                          <div
                            className="h-full rounded-full bg-cocoa/70"
                            style={{ width: `${Math.max(barWidth, 2)}%` }}
                          />
                        </div>
                        <span className="shrink-0 text-[10px] tabular-nums text-neutral-400">
                          {percent} dari total
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[13px] font-semibold tabular-nums text-neutral-900">
                        {number.format(page.views)}
                      </p>
                      <p className="text-[10px] tabular-nums text-neutral-400">
                        {number.format(page.uniqueVisitors)} unik
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        {topPages.length === 50 ? (
          <p className="mt-2 text-[11px] text-neutral-400">
            Menampilkan 50 halaman teratas.
          </p>
        ) : null}
      </section>

      <p className="mt-6 rounded-xl border border-neutral-200/80 bg-white px-4 py-3 text-[11px] leading-relaxed text-neutral-500">
        Yang tidak dihitung: halaman <code>/admin</code>, API, aset, bot/crawler,
        dan prefetch tautan. Pengunjung yang menghapus cookie akan dihitung
        sebagai pengunjung baru. Data dihitung dengan kalender WIB (UTC+7).
      </p>
    </div>
  );
}

function Metric({
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

function ChartCard({
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
