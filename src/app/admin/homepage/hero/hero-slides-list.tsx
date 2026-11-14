import Link from "next/link";

import {
  moveHeroSlideAction,
  toggleHeroSlideAction,
  type listHeroSlides,
} from "../../actions/hero-slides";
import { SmallSubmit } from "../../promos/_kit/form-ui";
import { Badge, Thumb } from "../../promos/_kit/list-ui";

type SlideRow = Awaited<ReturnType<typeof listHeroSlides>>[number];

/** Satu baris slide hero: tipe media, status, terbitkan/draf, dan urutan. */
export function HeroSlideListItem({
  row,
  index,
  count,
}: {
  row: SlideRow;
  index: number;
  count: number;
}) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <Thumb src={row.imageUrl} alt={row.imageAlt ?? ""} />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/admin/homepage/hero/${row.id}`}
              className="font-medium text-neutral-900 hover:underline"
            >
              {row.mediaType === "VIDEO" ? "Slide video" : "Slide foto"}
            </Link>
            <Badge tone={row.mediaType === "VIDEO" ? "blue" : "muted"}>
              {row.mediaType === "VIDEO" ? "Video" : "Foto"}
            </Badge>
            <Badge tone={row.isPublished ? "green" : "muted"}>
              {row.isPublished ? "Tayang" : "Draf"}
            </Badge>
          </div>
          <p className="mt-0.5 truncate text-xs text-neutral-500">
            urutan {row.sortOrder + 1} ·{" "}
            {row.mediaType === "VIDEO"
              ? row.videoUrl ?? "video belum diisi"
              : row.imageUrl ?? "gambar belum diisi"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <form action={toggleHeroSlideAction}>
          <input type="hidden" name="id" value={row.id} />
          <input
            type="hidden"
            name="isPublished"
            value={row.isPublished ? "0" : "1"}
          />
          <SmallSubmit
            title={row.isPublished ? "Jadikan draf" : "Terbitkan"}
          >
            {row.isPublished ? "Jadikan draf" : "Terbitkan"}
          </SmallSubmit>
        </form>
        <form action={moveHeroSlideAction}>
          <input type="hidden" name="id" value={row.id} />
          <input type="hidden" name="direction" value="up" />
          <SmallSubmit title="Naikkan" disabled={index === 0}>
            ↑
          </SmallSubmit>
        </form>
        <form action={moveHeroSlideAction}>
          <input type="hidden" name="id" value={row.id} />
          <input type="hidden" name="direction" value="down" />
          <SmallSubmit title="Turunkan" disabled={index === count - 1}>
            ↓
          </SmallSubmit>
        </form>
      </div>
    </li>
  );
}