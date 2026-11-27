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
        title="Photos & Gallery"
        subtitle={`${albums.length} photo albums. The order in this list matches the order on the /gallery page.`}
        action={
          <Link href="/admin/gallery/albums/new" className={primaryLinkClass}>
            Add album
          </Link>
        }
      />

      <StatusBanners
        saved={params.saved}
        deleted={params.deleted}
        deletedLabel="Album deleted."
      />

      <div className="mt-6">
        {albums.length === 0 ? (
          <p className="text-sm text-neutral-500">
            No albums yet. Create your first album to start adding photos.
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