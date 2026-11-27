import { requireRole } from "@/lib/auth";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { parseTrafficPeriod } from "@/lib/domain/traffic";

import { TrendArea, TrendBars } from "../_components/dashboard-charts";
import { loadAnalyticsData } from "./analytics-data";
import { AnalyticsHeader } from "./analytics-header";
import { ChartCard, Metric, decimal, number } from "./analytics-parts";
import { TopPagesSection } from "./analytics-top-pages";

export const instant = false;

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  await requireRole(CONTENT_ROLES);

  const params = await searchParams;
  const days = parseTrafficPeriod(params.days);
  const {
    visitorTrend,
    viewTrend,
    uniqueVisitors,
    views,
    distinctPaths,
    averageViews,
    topPages,
    loadError,
  } = await loadAnalyticsData(days);

  return (
    <div className="mx-auto max-w-6xl">
      <AnalyticsHeader days={days} />

      {loadError ? (
        <p
          role="alert"
          className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          Visitor data could not be loaded due to a database error. Try
          reloading the page in a few moments.
        </p>
      ) : null}

      <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Unique visitors" value={number.format(uniqueVisitors)} detail={`Last ${days} days`} />
        <Metric label="Page views" value={number.format(views)} detail="All public pages" />
        <Metric
          label="Average per visitor"
          value={decimal.format(averageViews)}
          detail="Pages opened"
        />
        <Metric
          label="Distinct pages"
          value={number.format(distinctPaths)}
          detail="URLs ever opened"
        />
      </section>

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

      <TopPagesSection topPages={topPages} views={views} days={days} />

      <p className="mt-6 rounded-xl border border-neutral-200/80 bg-white px-4 py-3 text-[11px] leading-relaxed text-neutral-500">
        Not counted: <code>/admin</code> pages, APIs, assets, bots/crawlers,
        and link prefetches. Visitors who delete their cookies are counted
        as new visitors. Data is calculated on the WIB (UTC+7) calendar.
      </p>
    </div>
  );
}