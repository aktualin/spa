import type { SeoOverviewGroup, SeoOverviewRow } from "../actions/seo";
import { SeoRow } from "./seo-overview-row";

/** Kelompok halaman per jenis konten (details terbuka untuk halaman tetap). */
export function SeoGroups({ groups }: { groups: SeoOverviewGroup[] }) {
  return (
    <>
      {groups.map((group) => (
        <details
          key={group.key}
          open={group.key === "static"}
          className="mt-6 overflow-hidden rounded-lg border border-neutral-200 bg-white"
        >
          <summary className="cursor-pointer select-none bg-neutral-50 px-4 py-2 text-sm font-semibold text-neutral-800">
            {group.label} <span className="font-normal text-neutral-500">({group.rows.length})</span>
          </summary>
          {group.rows.length === 0 ? (
            <p className="px-4 py-3 text-sm text-neutral-500">Belum ada data.</p>
          ) : (
            <ul className="divide-y divide-neutral-200">
              {group.rows.map((row) => (
                <SeoRow key={row.key} row={row} />
              ))}
            </ul>
          )}
        </details>
      ))}
    </>
  );
}

/** Entri SEO yang path-nya tidak cocok dengan halaman terdaftar. */
export function SeoOrphans({ orphans }: { orphans: SeoOverviewRow[] }) {
  if (orphans.length === 0) return null;
  return (
    <section className="mt-6 overflow-hidden rounded-lg border border-neutral-200 bg-white">
      <h2 className="bg-neutral-50 px-4 py-2 text-sm font-semibold text-neutral-800">
        Entri SEO lain
      </h2>
      <p className="px-4 pt-2 text-xs text-neutral-500">
        Path ini tidak cocok dengan halaman yang terdaftar di atas (mis.
        /menu/&lt;slug&gt;, atau slug yang sudah berubah). Periksa apakah
        path-nya masih benar.
      </p>
      <ul className="divide-y divide-neutral-200">
        {orphans.map((row) => (
          <SeoRow key={row.key} row={row} />
        ))}
      </ul>
    </section>
  );
}