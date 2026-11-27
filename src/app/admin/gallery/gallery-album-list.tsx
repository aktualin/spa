import Link from "next/link";

import { moveAlbumAction, type listAlbums } from "../actions/gallery";
import { SmallSubmit } from "../promos/_kit/form-ui";
import { Badge, Thumb } from "../promos/_kit/list-ui";

type Album = Awaited<ReturnType<typeof listAlbums>>[number];

/** Satu baris album: status, jumlah foto, urutan, dan tautan kelola. */
export function AlbumRow({
  album,
  index,
  count,
}: {
  album: Album;
  index: number;
  count: number;
}) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <Thumb src={album.coverUrl} alt={album.name} />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-neutral-900">
              {album.name}
            </span>
            {album.isPublished ? (
              <Badge tone="green">Published</Badge>
            ) : (
              <Badge tone="muted">Draft</Badge>
            )}
          </div>
          <p className="mt-0.5 truncate text-xs text-neutral-500">
            /{album.slug} · {album._count.photos} photos
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3 text-sm">
        <div className="flex items-center gap-1">
          <form action={moveAlbumAction}>
            <input type="hidden" name="id" value={album.id} />
            <input type="hidden" name="direction" value="up" />
            <SmallSubmit
              title={`Move album ${album.name} up`}
              disabled={index === 0}
            >
              ↑
            </SmallSubmit>
          </form>
          <form action={moveAlbumAction}>
            <input type="hidden" name="id" value={album.id} />
            <input type="hidden" name="direction" value="down" />
            <SmallSubmit
              title={`Move album ${album.name} down`}
              disabled={index === count - 1}
            >
              ↓
            </SmallSubmit>
          </form>
        </div>
        <Link
          href={`/admin/gallery/${album.id}`}
          className="text-neutral-800 underline"
        >
          Manage photos
        </Link>
        <Link
          href={`/admin/gallery/albums/${album.id}`}
          className="text-neutral-600 underline"
        >
          Edit album
        </Link>
      </div>
    </li>
  );
}