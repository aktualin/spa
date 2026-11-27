import type { TrendPoint } from "@/lib/domain/admin-dashboard";

import { TrendArea, TrendBars } from "../_components/dashboard-charts";
import { ChartCard, number } from "./analytics-parts";

/** Dua grafik tren pengunjung & tampilan halaman per hari. */
export function TrafficCharts({
  visitorTrend,
  viewTrend,
  uniqueVisitors,
  views,
  days,
}: {
  visitorTrend: TrendPoint[];
  viewTrend: TrendPoint[];
  uniqueVisitors: number;
  views: number;
  days: number;
}) {
  return (
    <section className="mt-4 grid gap-3 lg:grid-cols-2">
      <ChartCard
        title="Unique visitors per day"
        subtitle={`${number.format(uniqueVisitors)} unique visitors · ${days} days`}
      >
        <TrendArea
          points={visitorTrend}
          label="Unique visitors per day"
          suffix=" visitors"
        />
      </ChartCard>
      <ChartCard
        title="Page views per day"
        subtitle={`${number.format(views)} views · ${days} days`}
      >
        <TrendBars
          points={viewTrend}
          label="Page views per day"
          suffix=" views"
        />
      </ChartCard>
    </section>
  );
}