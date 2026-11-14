import Link from "next/link";

import {
  assessSeoText,
  formatPageTitle,
  isSeoFriendlyPath,
  type SeoTextAssessment,
} from "@/lib/domain/seo";

import type { SeoOverviewRow } from "../actions/seo";
import { Badge } from "../settings/_components/form-ui";
import { SOURCE_LABEL, effectiveMeta } from "./seo-overview-meta";

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

/** Satu baris overview SEO: sumber meta, badge peringatan, dan tautan editor. */
export function SeoRow({ row }: { row: SeoOverviewRow }) {
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