import Link from "next/link";

import { requirePageAccess } from "../access";
import { getSeoOverview, type SeoOverviewRow } from "../actions/seo";
import { Badge, StatusBanner } from "../settings/_components/form-ui";
import {
  assessSeoText,
  formatPageTitle,
  isSeoFriendlyPath,
  type SeoTextAssessment,
} from "@/lib/domain/seo";

export const instant = false;

type Effective = {
  source: "page-seo" | "content" | "fallback" | "default";
  title: string | null;
  description: string | null;
};

/** Meta yang benar-benar dipakai: entri SEO → SEO konten → nama/ringkasan → bawaan halaman. */
function effectiveMeta(row: SeoOverviewRow): Effective {
  const title =
    row.pageSeo?.title || row.contentSeo?.title || row.fallbackTitle || null;
  const description =
    row.pageSeo?.description ||
    row.contentSeo?.description ||
    row.fallbackDescription ||
    null;

  let source: Effective["source"] = "default";
  if (row.pageSeo?.title || row.pageSeo?.description) source = "page-seo";
  else if (row.contentSeo?.title || row.contentSeo?.description) source = "content";
  else if (row.fallbackTitle) source = "fallback";

  return { source, title, description };
}

const SOURCE_LABEL: Record<Effective["source"], string> = {
  "page-seo": "Entri SEO",
  content: "SEO konten",
  fallback: "Dari nama/ringkasan",
  default: "Bawaan halaman",
};

function LengthNote({ assessment }: { assessment: SeoTextAssessment }) {
  if (assessment.status === "empty") return null;
  const tone =
    assessment.status === "ideal"
      ? "text-neutral-500"
      : assessment.status === "long"
        ? "text-amber-700"
        : "text-neutral-500";
  return <span className={`text-[11px] ${tone}`}>{assessment.message}</span>;
}

function SeoRow({ row }: { row: SeoOverviewRow }) {
  const meta = effectiveMeta(row);
  const titleCheck = meta.title
    ? assessSeoText(formatPageTitle(meta.title), "title")
    : null;
  const descriptionCheck = meta.description
    ? assessSeoText(meta.description, "description")
    : null;
  const pageSeoHref = row.pageSeo
    ? `/admin/seo/${row.pageSeo.id}`
    : `/admin/seo/new?path=${encodeURIComponent(row.path)}`;
  const overridesContent = !!row.pageSeo && !!row.contentEditor;

  return (
    <li className="flex flex-col gap-2 px-4 py-3 md:flex-row md:items-start md:justify-between">
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-neutral-900">{row.label}</span>
          <code className="text-xs text-neutral-500">{row.path}</code>
          <Badge tone={meta.source === "default" || meta.source === "fallback" ? "muted" : "default"}>
            {SOURCE_LABEL[meta.source]}
          </Badge>
          {!row.isPublic ? <Badge tone="muted">Tidak tayang</Badge> : null}
          {!isSeoFriendlyPath(row.path) ? <Badge tone="warn">URL kurang ramah SEO</Badge> : null}
          {titleCheck?.status === "long" ? <Badge tone="warn">Title panjang</Badge> : null}
          {descriptionCheck?.status === "long" ? <Badge tone="warn">Desc panjang</Badge> : null}
          {row.contentEditor && !meta.description ? (
            <Badge tone="warn">Tanpa description</Badge>
          ) : null}
          {overridesContent ? <Badge tone="warn">Entri SEO menimpa SEO konten</Badge> : null}
        </div>
        <p className="truncate text-sm text-neutral-700">
          {meta.title ? formatPageTitle(meta.title) : <span className="text-neutral-400">Judul bawaan halaman</span>}
        </p>
        <p className="line-clamp-2 text-xs text-neutral-500">
          {meta.description ?? <span className="text-neutral-400">Description bawaan halaman</span>}
        </p>
        <div className="flex flex-wrap gap-x-3">
          {titleCheck ? <LengthNote assessment={titleCheck} /> : null}
          {descriptionCheck ? <LengthNote assessment={descriptionCheck} /> : null}
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2 md:flex-col md:items-end">
        {row.contentEditor ? (
          <Link
            href={row.contentEditor.href}
            className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm text-neutral-800 hover:bg-neutral-50"
          >
            Edit SEO di {row.contentEditor.label.toLowerCase()} →
          </Link>
        ) : null}
        {!row.contentEditor || row.pageSeo || row.path === "/our-story" ? (
          <Link href={pageSeoHref} className="text-sm text-neutral-700 hover:underline">
            {row.pageSeo ? "Ubah entri SEO" : "Atur meta & gambar OG"}
          </Link>
        ) : null}
      </div>
    </li>
  );
}

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

      {orphans.length > 0 ? (
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
      ) : null}
    </div>
  );
}
