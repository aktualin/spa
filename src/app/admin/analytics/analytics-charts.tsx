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
  );
}