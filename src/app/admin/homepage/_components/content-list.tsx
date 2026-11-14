import Link from "next/link";
import type { ReactNode } from "react";

import { PageHeader, StatusBanners, primaryLinkClass } from "../../promos/_kit/list-ui";
import { ContentListNotes } from "./content-list-notes";
import { ContentRow } from "./content-list-row";

export type ContentListRow = {
  id: string;
  title: string;
  meta: string;
  thumb?: string | null;
  isPublished: boolean;
};

type FormAction = (formData: FormData) => void | Promise<void>;

/**
 * Daftar admin bersama untuk Statistik, Ulasan, dan Feed Instagram: status
 * terbit, tombol Terbitkan/Jadikan draf, urutan ↑/↓, dan tombol "Salin data
 * bawaan" saat tabel kosong. Server component murni.
 */
export function ContentList({
  title,
  subtitle,
  basePath,
  addLabel,
  rows,
  saved,
  deleted,
  deletedLabel,
  emptyNote,
  importLabel,
  importAction,
  noLiveNote,
  footnote,
  toggleAction,
  moveAction,
  addDisabledNote,
}: {
  title: string;
  subtitle: string;
  basePath: string;
  addLabel: string;
  rows: ContentListRow[];
  saved?: string;
  deleted?: string;
  deletedLabel: string;
  emptyNote: ReactNode;
  importLabel: string;
  importAction: () => void | Promise<void>;
  noLiveNote: ReactNode;
  footnote: ReactNode;
  toggleAction: FormAction;
  moveAction: FormAction;
  addDisabledNote?: string | null;
}) {
  const liveCount = rows.filter((row) => row.isPublished).length;
  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/admin/homepage" className="text-sm text-neutral-600 hover:underline">
        ← Kembali ke Section Homepage
      </Link>

      <div className="mt-3">
        <PageHeader
          title={title}
          subtitle={subtitle}
          action={
            addDisabledNote ? (
              <span className="text-xs text-neutral-500">{addDisabledNote}</span>
            ) : (
              <Link href={`${basePath}/new`} className={primaryLinkClass}>
                {addLabel}
              </Link>
            )
          }
        />
      </div>

      <StatusBanners saved={saved} deleted={deleted} deletedLabel={deletedLabel} />

      <ContentListNotes
        isEmpty={rows.length === 0}
        liveCount={liveCount}
        emptyNote={emptyNote}
        importLabel={importLabel}
        importAction={importAction}
        noLiveNote={noLiveNote}
      />

      {rows.length > 0 ? (
        <ul className="mt-6 divide-y divide-neutral-200 overflow-hidden rounded-lg border border-neutral-200 bg-white">
          {rows.map((row, index) => (
            <ContentRow
              key={row.id}
              row={row}
              index={index}
              count={rows.length}
              basePath={basePath}
              toggleAction={toggleAction}
              moveAction={moveAction}
            />
          ))}
        </ul>
      ) : null}

      <p className="mt-6 text-xs text-neutral-500">{footnote}</p>
    </div>
  );
}