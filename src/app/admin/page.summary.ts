import { autoBackupHealth } from "@/lib/domain/backup";
import {
  dashboardAlerts,
  emptyContentSpots,
  journalStatusSegments,
  monthlyTrend,
  promoEndingSoonRange,
  type JournalStatusKey,
  type MonthBucket,
} from "@/lib/domain/admin-dashboard";

import { emptyContentSummary, type ContentSummary } from "./page.data";
import { fetchDashboardCounts } from "./page.queries";

/**
 * Ringkasan konten dashboard. Tidak boleh membuat dashboard kosong saat DB
 * bermasalah — tetap tampil dengan nilai 0 dan catatan error.
 */
export async function loadContentSummary(
  isAdmin: boolean,
  now: Date,
  buckets: MonthBucket[],
): Promise<ContentSummary> {
  const result = emptyContentSummary(buckets);
  const chartSince = buckets[0]!.start;

  try {
    const endingSoon = promoEndingSoonRange(now);
    // Status backup hanya diambil untuk ADMIN: modul Backup & Status memang
    // tertutup untuk EDITOR, jadi EDITOR tidak perlu diberi tahu soal itu.
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
    ] = await fetchDashboardCounts(now, chartSince, endingSoon, isAdmin);

    result.summary = {
      treatmentsPublished,
      packages,
      promosActive,
      journalPublished,
      eventsUpcoming,
    };

    result.alerts = dashboardAlerts({
      inquiriesNew,
      journalScheduled,
      journalOverdue,
      promosEndingSoon,
      emptyContent: emptyContentSpots(spotCounts),
      backup: isAdmin ? autoBackupHealth(lastAutoBackup?.createdAt ?? null, now) : null,
    });

    result.journalTrend = monthlyTrend(
      journalDates
        .map((row) => row.publishedAt)
        .filter((date): date is Date => date !== null),
      buckets,
    );
    result.inquiryTrend = monthlyTrend(
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
    result.statusSegments = journalStatusSegments(statusCounts);
  } catch {
    result.summaryError = true;
  }

  return result;
}