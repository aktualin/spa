import Link from "next/link";

import { formatBytes } from "@/lib/domain/media";

import { moveMediaAction, type MediaListItem } from "../actions/media";
import { SmallSubmit } from "../promos/_kit/form-ui";
import { Badge } from "../promos/_kit/list-ui";
import { formatWibDate } from "../promos/_kit/schema";

/** "image/jpeg" → "JPEG". */
function typeLabel(mimeType: string): string {
  return mimeType.startsWith("image/") ? mimeType.slice(6).toUpperCase() : mimeType;
}

/** Grid berkas Media Library; tombol urutan hanya saat satu folder dipilih. */
export function MediaGrid({
  items,
  canReorder,
  back,
  filtered,
}: {
  items: MediaListItem[];
  canReorder: boolean;
  back: string;
  filtered: boolean;
}) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-neutral-500">
        {filtered ? "Tidak ada berkas yang cocok dengan filter." : "Belum ada berkas. Unggah gambar pertama di atas."}
      </p>
    );
  }
  return (
    <>
      {!canReorder ? (
        <p className="mb-3 text-xs text-neutral-500">
          Untuk mengatur urutan, pilih satu folder tanpa pencarian atau filter lain.
        </p>
      ) : null}
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <li key={item.id} className="flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white">
            <Link href={`/admin/media/${item.id}`} className="block aspect-square bg-neutral-50">
              {/* URL berasal dari storage eksternal, jadi <img> biasa. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt={item.altText ?? ""}
                loading="lazy"
                className="size-full object-cover"
              />
            </Link>
            <div className="flex flex-1 flex-col gap-1 p-2.5 text-xs">
              <Link
                href={`/admin/media/${item.id}`}
                className="truncate font-medium text-neutral-900 hover:underline"
                title={item.fileName}
              >
                {item.title || item.fileName}
              </Link>
              {item.title ? <p className="truncate text-neutral-500">{item.fileName}</p> : null}
              <p className="text-neutral-500">
                {formatBytes(item.sizeBytes)} · {typeLabel(item.mimeType)} · {formatWibDate(item.createdAt)}
              </p>
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge tone="muted">{item.folder}</Badge>
                {item.usageCount > 0 ? (
                  <Badge tone="green">Dipakai {item.usageCount}×</Badge>
                ) : (
                  <Badge tone="amber">Tidak dipakai</Badge>
                )}
              </div>
              {canReorder ? (
                <div className="mt-auto flex gap-1.5 pt-1.5">
                  <form action={moveMediaAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="direction" value="up" />
                    <input type="hidden" name="back" value={back} />
                    <SmallSubmit title={`Naikkan urutan ${item.fileName} di folder ${item.folder}`}>↑</SmallSubmit>
                  </form>
                  <form action={moveMediaAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="direction" value="down" />
                    <input type="hidden" name="back" value={back} />
                    <SmallSubmit title={`Turunkan urutan ${item.fileName} di folder ${item.folder}`}>↓</SmallSubmit>
                  </form>
                </div>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}