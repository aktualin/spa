import Link from "next/link";

import { requireRole } from "@/lib/auth";
import { formatBytes } from "@/lib/domain/media";
import { CONTENT_ROLES } from "@/lib/domain/roles";

import { listMedia, listMediaFolders, moveMediaAction, syncMediaAction } from "../actions/media";
import { SmallSubmit, inputClass, secondaryButtonClass } from "../promos/_kit/form-ui";
import { Badge, PageHeader, StatusBanners } from "../promos/_kit/list-ui";
import { formatWibDate } from "../promos/_kit/schema";
import { UploadPanel } from "./upload-panel";

export const instant = false;

type Search = {
  folder?: string;
  q?: string;
  unused?: string;
  saved?: string;
  deleted?: string;
  synced?: string;
};

/** "image/jpeg" → "JPEG". */
function typeLabel(mimeType: string): string {
  return mimeType.startsWith("image/") ? mimeType.slice(6).toUpperCase() : mimeType;
}

export default async function AdminMediaPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  await requireRole(CONTENT_ROLES);

  const params = await searchParams;
  const folder = params.folder?.trim() || undefined;
  const q = params.q?.trim() || undefined;
  const unused = params.unused === "1";

  const [items, folders] = await Promise.all([
    listMedia({ folder, q, unused }),
    listMediaFolders(),
  ]);

  const query = new URLSearchParams();
  if (folder) query.set("folder", folder);
  if (q) query.set("q", q);
  if (unused) query.set("unused", "1");
  const back = query.size > 0 ? `/admin/media?${query}` : "/admin/media";
  const filtered = Boolean(folder || q || unused);
  // Urutan berlaku per folder; dengan pencarian/filter lain, tetangga yang
  // tertukar bisa jadi item yang sedang tersembunyi.
  const canReorder = Boolean(folder) && !q && !unused;
  const total = folders.reduce((sum, row) => sum + row.count, 0);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <PageHeader
          title="Media Library"
          subtitle={`${total} berkas di ${folders.length} folder. Semua gambar yang diunggah dari dashboard tercatat di sini.`}
          action={
            <form action={syncMediaAction}>
              <SmallSubmit title="Catat berkas lama yang sudah dipakai konten tetapi belum ada di Media Library">
                Sinkronkan berkas lama
              </SmallSubmit>
            </form>
          }
        />

        <StatusBanners saved={params.saved} deleted={params.deleted} deletedLabel="Berkas dihapus." />
        {params.synced !== undefined ? (
          <p role="status" className="mt-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-800">
            Sinkronisasi selesai: {Number(params.synced) || 0} berkas lama baru dicatat.
          </p>
        ) : null}
      </div>

      <UploadPanel folders={folders.map((row) => row.folder)} />

      <form method="get" className="flex flex-wrap items-end gap-3 rounded-lg border border-neutral-200 bg-white p-4">
        <div className="min-w-40 space-y-1.5">
          <label htmlFor="media-folder" className="block text-xs font-medium text-neutral-600">
            Folder
          </label>
          <select id="media-folder" name="folder" defaultValue={folder ?? ""} className={inputClass}>
            <option value="">Semua folder</option>
            {folders.map((row) => (
              <option key={row.folder} value={row.folder}>
                {row.folder} ({row.count})
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-48 flex-1 space-y-1.5">
          <label htmlFor="media-q" className="block text-xs font-medium text-neutral-600">
            Cari nama atau judul
          </label>
          <input id="media-q" name="q" type="search" defaultValue={q ?? ""} className={inputClass} />
        </div>
        <label className="flex items-center gap-2 pb-2 text-sm text-neutral-700">
          <input type="checkbox" name="unused" value="1" defaultChecked={unused} className="size-4 rounded border-neutral-300" />
          Hanya yang tidak dipakai
        </label>
        <div className="flex gap-2 pb-0.5">
          <button type="submit" className={secondaryButtonClass}>
            Terapkan
          </button>
          {filtered ? (
            <Link href="/admin/media" className={`${secondaryButtonClass} inline-block`}>
              Reset
            </Link>
          ) : null}
        </div>
      </form>

      {items.length === 0 ? (
        <p className="text-sm text-neutral-500">
          {filtered ? "Tidak ada berkas yang cocok dengan filter." : "Belum ada berkas. Unggah gambar pertama di atas."}
        </p>
      ) : (
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
      )}
    </div>
  );
}
