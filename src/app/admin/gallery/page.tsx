import Link from "next/link";

import { PageHeader, StatusBanners, primaryLinkClass } from "../promos/_kit/list-ui";
import { listAlbums } from "../actions/gallery";
import { AlbumRow } from "./gallery-album-list";

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
        subtitle={`${albums.length} album foto. Urutan di daftar ini sama dengan urutan di halaman /gallery.`}
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
            {albums.map((album, index) => (
              <AlbumRow key={album.id} album={album} index={index} count={albums.length} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}