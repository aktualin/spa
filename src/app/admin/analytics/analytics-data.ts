import { getTopPages, getTrafficOverview, type TopPage } from "@/lib/analytics/report";
import {
  averagePagesPerVisitor,
  dailyTrafficSeries,
  dayBuckets,
} from "@/lib/domain/traffic";

/**
 * Muat ringkasan trafik + halaman teratas untuk periode `days`.
 * Kegagalan database tidak melempar: ditandai `loadError` agar halaman
 * menampilkan pesan, bukan crash.
 */
export async function loadAnalyticsData(days: number) {
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
  const visitorTrend = dailyTrafficSeries(overview?.daily ?? [], buckets, "visitors");
  const viewTrend = dailyTrafficSeries(overview?.daily ?? [], buckets, "views");
  const uniqueVisitors = overview?.uniqueVisitors ?? 0;
  const views = overview?.totalViews ?? 0;
  const distinctPaths = overview?.distinctPaths ?? 0;
  const averageViews = averagePagesPerVisitor(views, uniqueVisitors);

  return {
    visitorTrend,
    viewTrend,
    uniqueVisitors,
    views,
    distinctPaths,
    averageViews,
    topPages,
    loadError,
  };
}