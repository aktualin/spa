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
          subtitle={`${journalPublished} terbit`}
        >
          <StatusDonut
            segments={statusSegments}
            label="Komposisi status journal"
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
  );
}