import Link from "next/link";

import { getTrafficOverview } from "@/lib/analytics/report";
import { requireSession } from "@/lib/auth";
import { autoBackupHealth } from "@/lib/domain/backup";
import {
  dashboardAlerts,
  emptyContentSpots,
  journalStatusSegments,
  monthBuckets,
  monthlyTrend,
  promoEndingSoonRange,
  type DashboardAlert,
  type JournalStatusKey,
  type JournalStatusSegment,
  type TrendPoint,
} from "@/lib/domain/admin-dashboard";
import {
  averagePagesPerVisitor,
  dailyTrafficSeries,
  dayBuckets,
} from "@/lib/domain/traffic";
import { prisma } from "@/lib/prisma";

import { StatusDonut, TrendArea, TrendBars } from "./_components/dashboard-charts";
import {
  groupedModulesForRole,
  modulesForRole,
  moduleLabelForPath,
  rolesForPath,
} from "./modules";

export const instant = false;

type Summary = {
  treatmentsPublished: number;
  packages: number;
  promosActive: number;
  journalPublished: number;
  eventsUpcoming: number;
};

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ forbidden?: string; password?: string }>;
}) {
  const session = await requireSession();
  const modules = modulesForRole(session.role);
  const groups = groupedModulesForRole(session.role);
  const ready = modules.filter((m) => m.ready).length;
  const params = await searchParams;
  // Nilai `forbidden` berasal dari URL: hanya dipakai untuk mencari nama modul
  // di matriks, tidak pernah ditampilkan mentah.
  const forbiddenLabel = params.forbidden
    ? moduleLabelForPath(params.forbidden)
    : null;
  const forbiddenRoles = forbiddenLabel ? rolesForPath(params.forbidden!) : [];

  const now = new Date();
  const buckets = monthBuckets(now, 6);
  const chartSince = buckets[0]!.start;

  // Analitik pengunjung berdiri sendiri: bila query-nya gagal, ringkasan konten
  // tetap tampil dan bagian pengunjung menunjukkan nilai nol + catatan.
  const trafficPromise = getTrafficOverview(now, 30).catch(() => null);

  // Ringkasan tidak boleh membuat dashboard kosong saat DB bermasalah —
  // dashboard tetap tampil dengan nilai 0 dan catatan error.
  let summary: Summary = {
    treatmentsPublished: 0,
    packages: 0,
    promosActive: 0,
    journalPublished: 0,
    eventsUpcoming: 0,
  };
  let alerts: DashboardAlert[] = [];
  let journalTrend: TrendPoint[] = monthlyTrend([], buckets);
  let inquiryTrend: TrendPoint[] = monthlyTrend([], buckets);
  let statusSegments: JournalStatusSegment[] = journalStatusSegments({
    PUBLISHED: 0,
    SCHEDULED: 0,
    DRAFT: 0,
  });
  let summaryError = false;

  try {
    const endingSoon = promoEndingSoonRange(now);
    // Status backup hanya diambil untuk ADMIN: modul Backup & Status memang
    // tertutup untuk EDITOR, jadi EDITOR tidak perlu diberi tahu soal itu.
    const isAdmin = session.role === "ADMIN";

    const [
      treatmentsPublished,
      packages,
      promosActive,
      journalPublished,
      eventsUpcoming,
      inquiriesNew,
      journalScheduled,
      journalOverdue,
      promosEndingSoon,
      spotCounts,
      lastAutoBackup,
      journalDates,
      inquiryDates,
      journalStatusRows,
    ] = await Promise.all([
      prisma.treatment.count({ where: { isPublished: true } }),
      prisma.package.count({ where: { isPublished: true } }),
      prisma.promo.count({
        where: {
          isPublished: true,
          AND: [
            { OR: [{ startDate: null }, { startDate: { lte: now } }] },
            { OR: [{ endDate: null }, { endDate: { gte: now } }] },
          ],
        },
      }),
      prisma.journalPost.count({ where: { status: "PUBLISHED" } }),
      prisma.eventItem.count({
        where: {
          isPublished: true,
          OR: [{ startDate: null }, { startDate: { gte: now } }],
        },
      }),
      prisma.corporateInquiry.count({ where: { status: "NEW" } }),
      prisma.journalPost.count({
        where: { status: "SCHEDULED", OR: [{ publishedAt: null }, { publishedAt: { gt: now } }] },
      }),
      prisma.journalPost.count({
        where: { status: "SCHEDULED", publishedAt: { lte: now } },
      }),
      prisma.promo.count({ where: { isPublished: true, endDate: endingSoon } }),
      contentSpotCounts(),
      isAdmin
        ? prisma.backupRun.findFirst({
            where: { kind: "AUTO", status: "SUCCESS" },
            orderBy: { createdAt: "desc" },
            select: { createdAt: true },
          })
        : Promise.resolve(null),
      prisma.journalPost.findMany({
        where: { status: "PUBLISHED", publishedAt: { gte: chartSince } },
        select: { publishedAt: true },
      }),
      prisma.corporateInquiry.findMany({
        where: { createdAt: { gte: chartSince } },
        select: { createdAt: true },
      }),
      prisma.journalPost.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
    ]);

    summary = {
      treatmentsPublished,
      packages,
      promosActive,
      journalPublished,
      eventsUpcoming,
    };

    alerts = dashboardAlerts({
      inquiriesNew,
      journalScheduled,
      journalOverdue,
      promosEndingSoon,
      emptyContent: emptyContentSpots(spotCounts),
      backup: isAdmin ? autoBackupHealth(lastAutoBackup?.createdAt ?? null, now) : null,
    });

    journalTrend = monthlyTrend(
      journalDates
        .map((row) => row.publishedAt)
        .filter((date): date is Date => date !== null),
      buckets,
    );
    inquiryTrend = monthlyTrend(
      inquiryDates.map((row) => row.createdAt),
      buckets,
    );

    const statusCounts: Record<JournalStatusKey, number> = {
      PUBLISHED: 0,
      SCHEDULED: 0,
      DRAFT: 0,
    };
    for (const row of journalStatusRows) {
      statusCounts[row.status] = row._count._all;
    }
    statusSegments = journalStatusSegments(statusCounts);
  } catch {
    summaryError = true;
  }

  const trafficReport = await trafficPromise;
  const trafficBuckets = trafficReport?.buckets ?? dayBuckets(now, 30);
  const visitorTrend = dailyTrafficSeries(
    trafficReport?.daily ?? [],
    trafficBuckets,
    "visitors",
  );
  const viewTrend = dailyTrafficSeries(
    trafficReport?.daily ?? [],
    trafficBuckets,
    "views",
  );
  const traffic = {
    uniqueVisitors: trafficReport?.uniqueVisitors ?? 0,
    totalViews: trafficReport?.totalViews ?? 0,
    visitorsToday: trafficReport?.visitorsToday ?? 0,
  };
  const averageViews = averagePagesPerVisitor(
    traffic.totalViews,
    traffic.uniqueVisitors,
  );
  const trafficError = trafficReport === null;
  const numberFormat = new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 1,
  });

  const journalTotal = journalTrend.reduce((sum, point) => sum + point.value, 0);
  const inquiryTotal = inquiryTrend.reduce((sum, point) => sum + point.value, 0);
  const formattedDate = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(now);
  const roleNote =
    session.role === "ADMIN"
      ? "Akses penuh, termasuk pengaturan sistem dan akun admin."
      : "Mengelola konten situs. Pengaturan sistem hanya bisa dibuka ADMIN.";

  return (
    <div className="mx-auto max-w-6xl">
      {params.forbidden ? (
        <p
          role="alert"
          className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          {forbiddenLabel
            ? `Anda tidak punya akses ke modul “${forbiddenLabel}”. Modul ini hanya bisa dibuka role ${forbiddenRoles.join(" atau ")}.`
            : "Anda tidak punya akses ke halaman tersebut."}{" "}
          Hubungi pemegang role ADMIN bila Anda memerlukannya.
        </p>
      ) : null}
      {params.password === "changed" ? (
        <p
          role="status"
          className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800"
        >
          Kata sandi berhasil diganti. Sesi di perangkat lain sudah dikeluarkan.
        </p>
      ) : null}

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
            Dashboard
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-900">
            Ringkasan
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            <span className="font-medium text-neutral-700">{session.email}</span>
            {" · "}
            {session.role}
          </p>
          <p className="mt-0.5 text-xs text-neutral-400">{roleNote}</p>
        </div>
        <p className="text-xs text-neutral-400">Data per {formattedDate}</p>
      </header>

      <section className="mt-7">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard label="Treatment terbit" value={summary.treatmentsPublished} />
          <StatCard label="Package terbit" value={summary.packages} />
          <StatCard label="Promo aktif" value={summary.promosActive} />
          <StatCard label="Journal terbit" value={summary.journalPublished} />
          <StatCard label="Event mendatang" value={summary.eventsUpcoming} />
        </div>
      </section>

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

      <section className="mt-8">
        <div>
          <h2 className="text-sm font-semibold text-neutral-900">Tren konten</h2>
          <p className="mt-0.5 text-xs text-neutral-400">
            Enam bulan terakhir · waktu Jakarta
          </p>
        </div>
        <div className="mt-3 grid gap-3 lg:grid-cols-3">
          <ChartCard
            title="Journal terbit"
            subtitle={`${journalTotal} artikel`}
          >
            <TrendBars
              points={journalTrend}
              label="Journal terbit per bulan"
              suffix=" artikel"
            />
          </ChartCard>
          <ChartCard
            title="Inquiry corporate"
            subtitle={`${inquiryTotal} inquiry`}
          >
            <TrendArea
              points={inquiryTrend}
              label="Inquiry corporate per bulan"
              suffix=" inquiry"
            />
          </ChartCard>
          <ChartCard
            title="Status journal"
            subtitle={`${summary.journalPublished} terbit`}
          >
            <StatusDonut
              segments={statusSegments}
              label="Komposisi status journal"
            />
          </ChartCard>
        </div>
      </section>

      <section className="mt-8">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-neutral-900">
            Perlu perhatian
          </h2>
          {alerts.length > 0 ? (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-amber-700">
              {alerts.length}
            </span>
          ) : null}
        </div>
        <AlertList alerts={alerts} />
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-neutral-900">Modul</h2>
        <p className="mt-0.5 text-xs text-neutral-400">
          Dikelompokkan mengikuti alur kerja: katalog, konten, halaman, lalu
          pengaturan sistem.
        </p>
        {groups.map((group) => (
          <div key={group.id} className="mt-4">
            <div className="flex items-center gap-3">
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
                {group.label}
              </h3>
              <span aria-hidden className="h-px flex-1 bg-neutral-200/80" />
            </div>
            <ul className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {group.modules.map((m) => (
                <li key={m.no}>
                  {m.ready ? (
                    <Link
                      href={m.href}
                      className="group flex h-full flex-col rounded-xl border border-neutral-200/80 bg-white px-4 py-3 transition hover:border-cocoa/40 hover:shadow-sm"
                    >
                      <span className="text-[13px] font-medium text-neutral-800 group-hover:text-cocoa">
                        {m.label}
                      </span>
                      <span className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-neutral-400">
                        {m.hint}
                      </span>
                    </Link>
                  ) : (
                    <span className="flex h-full flex-col rounded-xl border border-dashed border-neutral-200 px-4 py-3 text-[13px] text-neutral-400">
                      {m.label} (segera)
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {summaryError ? (
        <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Ringkasan konten tidak dapat dimuat karena kesalahan database. Halaman
          dashboard tetap bisa digunakan.
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-neutral-200/80 bg-white px-4 py-3">
        <p className="text-xs text-neutral-500">
          Progres modul{" "}
          <strong className="font-semibold text-neutral-800">{ready}</strong>{" "}
          dari <strong className="font-semibold text-neutral-800">{modules.length}</strong>
        </p>
        <div
          className="h-1.5 min-w-24 flex-1 overflow-hidden rounded-full bg-neutral-100"
          role="progressbar"
          aria-valuenow={ready}
          aria-valuemin={0}
          aria-valuemax={modules.length}
        >
          <div
            className="h-full rounded-full bg-cocoa transition-all"
            style={{ width: `${(ready / modules.length) * 100}%` }}
          />
        </div>
        <p className="text-[11px] text-neutral-400">
          Modul “segera” sedang dalam pengerjaan (Tahap 2 — target 30 November
          2026).
        </p>
      </div>
    </div>
  );
}

/**
 * Jumlah baris tiap tempat konten di `CONTENT_SPOTS`. Satu query per tabel,
 * semuanya paralel; kunci hasilnya sama dengan `ContentSpot.key`.
 */
async function contentSpotCounts(): Promise<Record<string, number>> {
  const [
    homepageHighlight,
    homepageReview,
    homepageStat,
    instagramPost,
    contentBlock,
    branch,
    galleryPhoto,
    retailProduct,
    menuItem,
    staticPage,
  ] = await Promise.all([
    prisma.homepageHighlight.count(),
    prisma.homepageReview.count(),
    prisma.homepageStat.count(),
    prisma.instagramPost.count(),
    prisma.contentBlock.count(),
    prisma.branch.count(),
    prisma.galleryPhoto.count(),
    prisma.retailProduct.count(),
    prisma.menuItem.count(),
    prisma.staticPage.count(),
  ]);

  return {
    homepageHighlight,
    homepageReview,
    homepageStat,
    instagramPost,
    contentBlock,
    branch,
    galleryPhoto,
    retailProduct,
    menuItem,
    staticPage,
  };
}

function AlertList({ alerts }: { alerts: DashboardAlert[] }) {
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

function StatCard({ label, value }: { label: string; value: number }) {
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
        <h3 className="text-xs font-semibold text-neutral-700">{title}</h3>
        <span className="text-[11px] tabular-nums text-neutral-400">
          {subtitle}
        </span>
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}
