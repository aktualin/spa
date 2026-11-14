import Link from "next/link";

import {
  assessSeoText,
  formatPageTitle,
  isSeoFriendlyPath,
} from "@/lib/domain/seo";

import { requirePageAccess } from "../access";
import { getSeoOverview } from "../actions/seo";
import { StatusBanner } from "../settings/_components/form-ui";
import { SeoGroups, SeoOrphans } from "./seo-overview-list";
import { effectiveMeta } from "./seo-overview-meta";

export const instant = false;

export default async function AdminSeoPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string }>;
}) {
  await requirePageAccess("/admin/seo");

  const [{ groups, orphans }, params] = await Promise.all([
    getSeoOverview(),
    searchParams,
  ]);

  const allRows = [...groups.flatMap((group) => group.rows), ...orphans];
  const warnings = allRows.filter((row) => {
    const meta = effectiveMeta(row);
    return (
      (meta.title && assessSeoText(formatPageTitle(meta.title), "title").status === "long") ||
      (meta.description && assessSeoText(meta.description, "description").status === "long") ||
      !isSeoFriendlyPath(row.path)
    );
  }).length;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">SEO</h1>
          <p className="mt-1 text-sm text-neutral-600">
            {allRows.length} halaman publik · {warnings} perlu perhatian. Meta
            title idealnya ≤ 60 karakter (termasuk “ • KAMA Spa”), description ≤ 160.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/seo/settings"
            className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
          >
            Favicon, OG &amp; Search Console
          </Link>
          <Link
            href="/admin/seo/new"
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
          >
            Tambah entri
          </Link>
        </div>
      </div>

      <StatusBanner
        saved={params.saved}
        deleted={params.deleted}
        deletedText="Entri SEO dihapus — halaman kembali memakai meta bawaannya."
      />

      <div className="mt-4 rounded-md border border-neutral-200 bg-neutral-50 px-4 py-3 text-xs text-neutral-600">
        <p>
          <strong>Halaman tetap</strong> diatur di sini lewat entri SEO.{" "}
          <strong>Treatment, kategori, package, artikel, event, promo, dan
          halaman</strong> punya field SEO sendiri di modulnya — gunakan tombol
          “Edit SEO di …”. Entri SEO di sini untuk halaman konten akan
          menimpa SEO kontennya, jadi sebaiknya tidak dipakai.
        </p>
        <p className="mt-1">
          Sitemap: <a href="/sitemap.xml" target="_blank" rel="noreferrer" className="underline">/sitemap.xml</a>{" "}
          · Robots: <a href="/robots.txt" target="_blank" rel="noreferrer" className="underline">/robots.txt</a>{" "}
          — keduanya dibuat otomatis dari database (hanya konten yang tayang).
        </p>
      </div>

      <SeoGroups groups={groups} />
      <SeoOrphans orphans={orphans} />
    </div>
  );
}