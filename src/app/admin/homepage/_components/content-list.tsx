import Link from "next/link";
import type { ReactNode } from "react";

import { SmallSubmit } from "../../promos/_kit/form-ui";
import {
  Badge,
  PageHeader,
  StatusBanners,
  Thumb,
  primaryLinkClass,
} from "../../promos/_kit/list-ui";

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

      {rows.length === 0 ? (
        <div className="mt-6 space-y-3 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {emptyNote}
          <form action={importAction}>
            <SmallSubmit>{importLabel}</SmallSubmit>
          </form>
        </div>
      ) : liveCount === 0 ? (
        <p className="mt-6 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {noLiveNote}
        </p>
      ) : null}

      {rows.length > 0 ? (
        <ul className="mt-6 divide-y divide-neutral-200 overflow-hidden rounded-lg border border-neutral-200 bg-white">
          {rows.map((row, index) => (
            <li
              key={row.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                {row.thumb !== undefined ? <Thumb src={row.thumb} alt="" /> : null}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`${basePath}/${row.id}`}
                      className="font-medium text-neutral-900 hover:underline"
                    >
                      {row.title}
                    </Link>
                    <Badge tone={row.isPublished ? "green" : "muted"}>
                      {row.isPublished ? "Tayang" : "Draf"}
                    </Badge>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-neutral-500">{row.meta}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <form action={toggleAction}>
                  <input type="hidden" name="id" value={row.id} />
                  <input type="hidden" name="isPublished" value={row.isPublished ? "0" : "1"} />
                  <SmallSubmit title={row.isPublished ? "Jadikan draf" : "Terbitkan"}>
                    {row.isPublished ? "Jadikan draf" : "Terbitkan"}
                  </SmallSubmit>
                </form>
                <form action={moveAction}>
                  <input type="hidden" name="id" value={row.id} />
                  <input type="hidden" name="direction" value="up" />
                  <SmallSubmit title="Naikkan" disabled={index === 0}>
                    ↑
                  </SmallSubmit>
                </form>
                <form action={moveAction}>
                  <input type="hidden" name="id" value={row.id} />
                  <input type="hidden" name="direction" value="down" />
                  <SmallSubmit title="Turunkan" disabled={index === rows.length - 1}>
                    ↓
                  </SmallSubmit>
                </form>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <p className="mt-6 text-xs text-neutral-500">{footnote}</p>
    </div>
  );
}
