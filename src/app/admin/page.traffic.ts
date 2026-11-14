import { getTrafficOverview } from "@/lib/analytics/report";
import { averagePagesPerVisitor, dailyTrafficSeries, dayBuckets } from "@/lib/domain/traffic";
import type { TrendPoint } from "@/lib/domain/admin-dashboard";

export type TrafficSummary = {
  visitorTrend: TrendPoint[];
  viewTrend: TrendPoint[];
  traffic: { uniqueVisitors: number; totalViews: number; visitorsToday: number };
  averageViews: number;
  trafficError: boolean;
};

type TrafficReport = Awaited<ReturnType<typeof getTrafficOverview>>;

/**
 * Analitik pengunjung berdiri sendiri: bila query-nya gagal (null), ringkasan
 * konten tetap tampil dan bagian pengunjung menunjukkan nilai nol + catatan.
 */
export function loadTraffic(now: Date, trafficReport: TrafficReport | null): TrafficSummary {
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
  return { visitorTrend, viewTrend, traffic, averageViews, trafficError: trafficReport === null };
}