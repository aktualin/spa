import Link from "next/link";

import { Badge, PageHeader, StatusBanners, Thumb, primaryLinkClass } from "../promos/_kit/list-ui";
import { listAlbums } from "../actions/gallery";

export const instant = false;

export default async function AdminGalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string }>;
}) {
  const [albums, params] = await Promise.all([listAlbums(), searchParams]);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Foto & Gallery"
        subtitle={`${albums.length} album foto.`}
        action={
          <Link href="/admin/gallery/albums/new" className={primaryLinkClass}>
            Tambah album
          </Link>
        }
      />

      <StatusBanners
        saved={params.saved}
        deleted={params.deleted}
        deletedLabel="Album dihapus."
      />

      <div className="mt-6">
        {albums.length === 0 ? (
          <p className="text-sm text-neutral-500">
            Belum ada album. Buat album pertama untuk mulai menambah foto.
          </p>
        ) : (
          <ul className="divide-y divide-neutral-200 overflow-hidden rounded-lg border border-neutral-200 bg-white">
            {albums.map((album) => (
              <li
                key={album.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Thumb src={album.coverUrl} alt={album.name} />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-neutral-900">
                        {album.name}
                      </span>
                      {album.isPublished ? (
                        <Badge tone="green">Tayang</Badge>
                      ) : (
                        <Badge tone="muted">Draf</Badge>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-neutral-500">
                      /{album.slug} · {album._count.photos} foto
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-3 text-sm">
                  <Link
                    href={`/admin/gallery/${album.id}`}
                    className="text-neutral-800 underline"
                  >
                    Kelola foto
                  </Link>
                  <Link
                    href={`/admin/gallery/albums/${album.id}`}
                    className="text-neutral-600 underline"
                  >
                    Ubah album
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
