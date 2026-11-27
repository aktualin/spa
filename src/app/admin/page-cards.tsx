import { StatCard } from "./_components/dashboard-cards";
import type { Summary } from "./page.data";

/** Lima kartu ringkasan konten di bagian atas dashboard. */
export function ContentStatCards({ summary }: { summary: Summary }) {
  return (
    <section className="mt-7">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Published treatments" value={summary.treatmentsPublished} />
        <StatCard label="Published packages" value={summary.packages} />
        <StatCard label="Active promos" value={summary.promosActive} />
        <StatCard label="Published journal posts" value={summary.journalPublished} />
        <StatCard label="Upcoming events" value={summary.eventsUpcoming} />
      </div>
    </section>
  );
}