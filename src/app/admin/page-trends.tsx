import type {
  DashboardAlert,
  JournalStatusSegment,
  TrendPoint,
} from "@/lib/domain/admin-dashboard";

import { AlertList, ChartCard } from "./_components/dashboard-cards";
import { StatusDonut, TrendArea, TrendBars } from "./_components/dashboard-charts";

export function ContentTrendsSection({
  journalTrend,
  inquiryTrend,
  statusSegments,
  journalTotal,
  inquiryTotal,
  journalPublished,
}: {
  journalTrend: TrendPoint[];
  inquiryTrend: TrendPoint[];
  statusSegments: JournalStatusSegment[];
  journalTotal: number;
  inquiryTotal: number;
  journalPublished: number;
}) {
  return (
    <section className="mt-8">
      <div>
        <h2 className="text-sm font-semibold text-neutral-900">Content trends</h2>
        <p className="mt-0.5 text-xs text-neutral-400">
          Last six months · Jakarta time
        </p>
      </div>
      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        <ChartCard
          title="Published journal posts"
          subtitle={`${journalTotal} articles`}
        >
          <TrendBars
            points={journalTrend}
            label="Published journal posts per month"
            suffix=" articles"
          />
        </ChartCard>
        <ChartCard
          title="Corporate inquiries"
          subtitle={`${inquiryTotal} inquiries`}
        >
          <TrendArea
            points={inquiryTrend}
            label="Corporate inquiries per month"
            suffix=" inquiries"
          />
        </ChartCard>
        <ChartCard
          title="Journal status"
          subtitle={`${journalPublished} published`}
        >
          <StatusDonut
            segments={statusSegments}
            label="Journal status breakdown"
          />
        </ChartCard>
      </div>
    </section>
  );
}

export function AlertsSection({ alerts }: { alerts: DashboardAlert[] }) {
  return (
    <section className="mt-8">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold text-neutral-900">
          Needs attention
        </h2>
        {alerts.length > 0 ? (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-amber-700">
            {alerts.length}
          </span>
        ) : null}
      </div>
      <AlertList alerts={alerts} />
    </section>
  );
}