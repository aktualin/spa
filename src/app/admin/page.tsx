import { getTrafficOverview } from "@/lib/analytics/report";
import { requireSession } from "@/lib/auth";
import { monthBuckets } from "@/lib/domain/admin-dashboard";

import {
  groupedModulesForRole,
  modulesForRole,
  moduleLabelForPath,
  rolesForPath,
} from "./modules";
import { ContentStatCards } from "./page-cards";
import { DashboardBanners, DashboardHeader } from "./page-header";
import { ModulesSection, ProgressFooter, SummaryErrorNote } from "./page-modules";
import { loadContentSummary } from "./page.summary";
import { loadTraffic } from "./page.traffic";
import { AlertsSection, ContentTrendsSection } from "./page-trends";
import { VisitorsSection } from "./page-visitors";

export const instant = false;

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

  // Analitik pengunjung berdiri sendiri: bila query-nya gagal, ringkasan konten
  // tetap tampil dan bagian pengunjung menunjukkan nilai nol + catatan.
  const trafficPromise = getTrafficOverview(now, 30).catch(() => null);

  const { summary, alerts, journalTrend, inquiryTrend, statusSegments, summaryError } =
    await loadContentSummary(session.role === "ADMIN", now, buckets);

  const { visitorTrend, viewTrend, traffic, averageViews, trafficError } = loadTraffic(
    now,
    await trafficPromise,
  );
  const numberFormat = new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 1,
  });

  const journalTotal = journalTrend.reduce((sum, point) => sum + point.value, 0);
  const inquiryTotal = inquiryTrend.reduce((sum, point) => sum + point.value, 0);

  return (
    <div className="mx-auto max-w-6xl">
      <DashboardBanners
        forbidden={params.forbidden}
        password={params.password}
        forbiddenLabel={forbiddenLabel}
        forbiddenRoles={forbiddenRoles}
      />
      <DashboardHeader email={session.email} role={session.role} now={now} />

      <ContentStatCards summary={summary} />

      <VisitorsSection
        traffic={traffic}
        visitorTrend={visitorTrend}
        viewTrend={viewTrend}
        averageViews={averageViews}
        numberFormat={numberFormat}
        trafficError={trafficError}
      />
      <ContentTrendsSection
        journalTrend={journalTrend}
        inquiryTrend={inquiryTrend}
        statusSegments={statusSegments}
        journalTotal={journalTotal}
        inquiryTotal={inquiryTotal}
        journalPublished={summary.journalPublished}
      />
      <AlertsSection alerts={alerts} />
      <ModulesSection groups={groups} />

      {summaryError ? <SummaryErrorNote /> : null}
      <ProgressFooter ready={ready} total={modules.length} />
    </div>
  );
}