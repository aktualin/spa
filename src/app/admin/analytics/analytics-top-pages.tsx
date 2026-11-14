import Link from "next/link";

import type { TopPage } from "@/lib/analytics/report";
import { pageViewShare } from "@/lib/domain/traffic";

import { number } from "./analytics-parts";

/** Tabel 50 halaman terpopuler beserta bar porsi tampilan. */
export function TopPagesSection({
  topPages,
  views,
  days,
}: {
  topPages: TopPage[];
  views: number;
  days: number;
}) {
  const busiestPage = topPages[0]?.views ?? 0;
  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-neutral-900">
            Halaman terpopuler
          </h2>
          <p className="mt-0.5 text-xs text-neutral-400">
            {days} hari terakhir · diurutkan dari tampilan terbanyak
          </p>
        </div>
        <p className="text-[11px] tabular-nums text-neutral-400">
          {number.format(topPages.length)} halaman
        </p>
      </div>

      {topPages.length === 0 ? (
        <p className="mt-3 rounded-xl border border-dashed border-neutral-200 bg-white px-4 py-8 text-center text-sm text-neutral-400">
          Belum ada kunjungan pada periode ini. Data mulai terkumpul setelah
          fitur analitik aktif dan ada pengunjung membuka situs.
        </p>
      ) : (
        <div className="mt-3 overflow-hidden rounded-xl border border-neutral-200/80 bg-white">
          <div className="flex items-center gap-3 border-b border-neutral-100 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400 sm:px-5">
            <span className="w-5 text-right">#</span>
            <span className="min-w-0 flex-1">Halaman</span>
            <span className="shrink-0 text-right">Tampilan</span>
          </div>
          <ul className="divide-y divide-neutral-100">
            {topPages.map((page, index) => {
              const share = pageViewShare(page.views, views);
              const percent =
                share === 0
                  ? "0%"
                  : share < 0.01
                    ? "<1%"
                    : `${Math.round(share * 100)}%`;
              const barWidth =
                busiestPage > 0 ? (page.views / busiestPage) * 100 : 0;

              return (
                <li
                  key={page.path}
                  className="grid grid-cols-[1.25rem_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-5"
                >
                  <span className="text-right text-[11px] tabular-nums text-neutral-400">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <Link
                      href={page.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={page.path}
                      className="block truncate text-[13px] font-medium text-neutral-800 underline-offset-2 hover:text-cocoa hover:underline"
                    >
                      {page.path === "/" ? "Beranda" : page.path}
                    </Link>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-neutral-100">
                        <div
                          className="h-full rounded-full bg-cocoa/70"
                          style={{ width: `${Math.max(barWidth, 2)}%` }}
                        />
                      </div>
                      <span className="shrink-0 text-[10px] tabular-nums text-neutral-400">
                        {percent} dari total
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[13px] font-semibold tabular-nums text-neutral-900">
                      {number.format(page.views)}
                    </p>
                    <p className="text-[10px] tabular-nums text-neutral-400">
                      {number.format(page.uniqueVisitors)} unik
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      {topPages.length === 50 ? (
        <p className="mt-2 text-[11px] text-neutral-400">
          Menampilkan 50 halaman teratas.
        </p>
      ) : null}
    </section>
  );
}