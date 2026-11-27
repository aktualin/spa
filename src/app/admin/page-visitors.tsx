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
          <h2 className="text-sm font-semibold text-neutral-900">Visitors</h2>
          <p className="mt-0.5 text-xs text-neutral-400">
            Last 30 days · Jakarta time
          </p>
        </div>
        <Link
          href="/admin/analytics"
          className="text-xs font-medium text-cocoa underline-offset-2 hover:underline"
        >
          Page details →
        </Link>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <StatCard label="Unique visitors" value={traffic.uniqueVisitors} />
        <StatCard label="Page views" value={traffic.totalViews} />
        <StatCard label="Visitors today" value={traffic.visitorsToday} />
      </div>
      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        <ChartCard
          title="Unique visitors per day"
          subtitle={`${traffic.uniqueVisitors} unique visitors`}
        >
          <TrendArea
            points={visitorTrend}
            label="Unique visitors per day"
            suffix=" visitors"
          />
        </ChartCard>
        <ChartCard
          title="Page views per day"
          subtitle={`${traffic.totalViews} views`}
        >
          <TrendBars
            points={viewTrend}
            label="Page views per day"
            suffix=" views"
          />
        </ChartCard>
        <div className="rounded-xl border border-neutral-200/80 bg-white p-4 sm:p-5">
          <h3 className="text-xs font-semibold text-neutral-700">
            How we count
          </h3>
          <ul className="mt-2 space-y-1.5 text-[11px] leading-relaxed text-neutral-500">
            <li>
              Unique visitors use a random ID in a cookie, not the IP address.
            </li>
            <li>
              Admin, API, asset, bot, and prefetch requests are not counted.
            </li>
            <li>
              On average, {numberFormat.format(averageViews)} pages were opened
              per visitor in this period.
            </li>
          </ul>
          <Link
            href="/admin/analytics"
            className="mt-3 inline-block text-[11px] font-medium text-cocoa underline-offset-2 hover:underline"
          >
            View the most popular pages →
          </Link>
        </div>
      </div>
      {trafficError ? (
        <p className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Visitor data could not be loaded due to a database error. The numbers
          above are shown as zero.
        </p>
      ) : null}
    </section>
  );
}