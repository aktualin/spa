import Link from "next/link";

import { formatBytes } from "@/lib/domain/media";

import { deleteMediaAction, type MediaUsage, type getMediaDetail } from "../actions/media";
import { ConfirmDeleteButton, secondaryButtonClass } from "../promos/_kit/form-ui";
import { formatWibDateTime } from "../promos/_kit/schema";
import { CopyUrlButton } from "./media-forms";

type Asset = NonNullable<Awaited<ReturnType<typeof getMediaDetail>>>["asset"];

/** Pratinjau gambar + metadata berkas + tombol salin/buka. */
export function AssetPreview({ asset }: { asset: Asset }) {
  return (
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
  );
}

/** Daftar "Dipakai di" konten. */
export function UsageList({ usages }: { usages: MediaUsage[] }) {
  if (usages.length === 0) {
    return <p className="text-sm text-neutral-500">Belum dipakai di konten mana pun.</p>;
  }
  return (
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
  );
}

/** Bagian hapus berkas (terkunci selama masih dipakai). */
export function DeleteAssetSection({ assetId, usageCount }: { assetId: string; usageCount: number }) {
  return (
    <section className="space-y-2 border-t border-neutral-200 pt-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Hapus berkas</h2>
      {usageCount > 0 ? (
        <p className="text-sm text-neutral-600">
          Berkas masih dipakai di {usageCount} tempat, jadi belum bisa dihapus. Ganti atau
          kosongkan gambar di konten tersebut terlebih dahulu.
        </p>
      ) : (
        <form action={deleteMediaAction}>
          <input type="hidden" name="id" value={assetId} />
          <ConfirmDeleteButton message="Hapus berkas ini secara permanen dari penyimpanan?">
            Hapus berkas
          </ConfirmDeleteButton>
        </form>
      )}
    </section>
  );
}