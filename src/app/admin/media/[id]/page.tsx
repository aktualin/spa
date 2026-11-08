import Link from "next/link";
import { notFound } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { formatBytes } from "@/lib/domain/media";
import { CONTENT_ROLES } from "@/lib/domain/roles";

import { deleteMediaAction, getMediaDetail } from "../../actions/media";
import { ConfirmDeleteButton, secondaryButtonClass } from "../../promos/_kit/form-ui";
import { StatusBanners } from "../../promos/_kit/list-ui";
import { formatWibDateTime } from "../../promos/_kit/schema";
import { CopyUrlButton, MediaMetaForm, ReplaceFileForm } from "../media-forms";

export const instant = false;

export default async function AdminMediaDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; blocked?: string; error?: string }>;
}) {
  await requireRole(CONTENT_ROLES);

  const [{ id }, query] = await Promise.all([params, searchParams]);
  const detail = await getMediaDetail(id);
  if (!detail) notFound();

  const { asset, usages } = detail;
  const inUse = usages.length > 0;

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/admin/media" className="text-sm text-neutral-600 hover:underline">
        ← Kembali ke Media Library
      </Link>

      <h1 className="mt-3 break-all text-xl font-semibold text-neutral-900">
        {asset.title || asset.fileName}
      </h1>

      <StatusBanners saved={query.saved} />
      {query.blocked ? (
        <p role="alert" className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          Berkas tidak bisa dihapus karena masih dipakai. Lepaskan dulu dari konten di daftar “Dipakai di”.
        </p>
      ) : null}
      {query.error === "storage" ? (
        <p role="alert" className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          Gagal menghapus berkas dari penyimpanan. Coba lagi beberapa saat lagi.
        </p>
      ) : null}

      <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-3">
          <div className="flex items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
            {/* URL berasal dari storage eksternal, jadi <img> biasa. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset.url} alt={asset.altText ?? ""} className="max-h-[28rem] w-full object-contain" />
          </div>

          <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1 text-sm">
            <dt className="text-neutral-500">Ukuran</dt>
            <dd className="text-neutral-900">{formatBytes(asset.sizeBytes)}</dd>
            <dt className="text-neutral-500">Tipe</dt>
            <dd className="text-neutral-900">{asset.mimeType}</dd>
            {asset.width && asset.height ? (
              <>
                <dt className="text-neutral-500">Dimensi</dt>
                <dd className="text-neutral-900">
                  {asset.width} × {asset.height} px
                </dd>
              </>
            ) : null}
            <dt className="text-neutral-500">Folder</dt>
            <dd className="text-neutral-900">{asset.folder}</dd>
            <dt className="text-neutral-500">Diunggah</dt>
            <dd className="text-neutral-900">
              {formatWibDateTime(asset.createdAt)}
              {asset.uploadedBy ? ` oleh ${asset.uploadedBy.name}` : ""}
            </dd>
            <dt className="text-neutral-500">URL</dt>
            <dd className="break-all text-neutral-900">{asset.url}</dd>
          </dl>

          <div className="flex flex-wrap gap-2">
            <CopyUrlButton url={asset.url} />
            <a href={asset.url} target="_blank" rel="noreferrer" className={secondaryButtonClass}>
              Buka berkas
            </a>
          </div>
        </div>

        <div className="space-y-8">
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Informasi</h2>
            <MediaMetaForm
              id={asset.id}
              fileName={asset.fileName}
              title={asset.title ?? ""}
              altText={asset.altText ?? ""}
            />
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
              Dipakai di ({usages.length})
            </h2>
            {inUse ? (
              <ul className="divide-y divide-neutral-200 rounded-lg border border-neutral-200 bg-white text-sm">
                {usages.map((usage, index) => (
                  <li key={`${usage.label}-${usage.href}-${index}`} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
                    <div className="min-w-0">
                      <p className="text-xs text-neutral-500">{usage.label}</p>
                      <p className="truncate text-neutral-900">{usage.name || "(tanpa nama)"}</p>
                    </div>
                    {usage.href ? (
                      <Link href={usage.href} className="shrink-0 text-neutral-700 underline">
                        Buka
                      </Link>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-neutral-500">Belum dipakai di konten mana pun.</p>
            )}
          </section>

          <section className="space-y-3">
            <ReplaceFileForm id={asset.id} folder={asset.folder} usageCount={usages.length} />
          </section>

          <section className="space-y-2 border-t border-neutral-200 pt-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Hapus berkas</h2>
            {inUse ? (
              <p className="text-sm text-neutral-600">
                Berkas masih dipakai di {usages.length} tempat, jadi belum bisa dihapus. Ganti atau
                kosongkan gambar di konten tersebut terlebih dahulu.
              </p>
            ) : (
              <form action={deleteMediaAction}>
                <input type="hidden" name="id" value={asset.id} />
                <ConfirmDeleteButton message="Hapus berkas ini secara permanen dari penyimpanan?">
                  Hapus berkas
                </ConfirmDeleteButton>
              </form>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
