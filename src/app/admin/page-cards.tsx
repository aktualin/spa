import { StatCard } from "./_components/dashboard-cards";
import type { Summary } from "./page.data";

/** Lima kartu ringkasan konten di bagian atas dashboard. */
export function ContentStatCards({ summary }: { summary: Summary }) {
  return (
    <section className="mt-7">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Treatment terbit" value={summary.treatmentsPublished} />
        <StatCard label="Package terbit" value={summary.packages} />
        <StatCard label="Promo aktif" value={summary.promosActive} />
        <StatCard label="Journal terbit" value={summary.journalPublished} />
        <StatCard label="Event mendatang" value={summary.eventsUpcoming} />
      </div>
    </section>
  );
}