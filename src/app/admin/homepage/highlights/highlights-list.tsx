import Link from "next/link";

import type { HighlightStatus } from "@/lib/domain/homepage";

import {
  moveHomepageHighlightAction,
  toggleHomepageHighlightAction,
  type listHomepageHighlights,
} from "../../actions/homepage-highlights";
import { SmallSubmit } from "../../promos/_kit/form-ui";
import { Badge, Thumb, type BadgeTone } from "../../promos/_kit/list-ui";
import { formatWibDate } from "../../promos/_kit/schema";

const STATUS_TONE: Record<HighlightStatus, BadgeTone> = {
  Draf: "muted",
  Terjadwal: "blue",
  Berakhir: "red",
  Tayang: "green",
};

export type HighlightRow = Awaited<ReturnType<typeof listHomepageHighlights>>[number] & {
  status: HighlightStatus;
};

/** Satu baris highlight: status, terbitkan/draf, dan urutan. */
export function HighlightListItem({
  row,
  index,
  count,
}: {
  row: HighlightRow;
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
              href={`/admin/homepage/highlights/${row.id}`}
              className="font-medium text-neutral-900 hover:underline"
            >
              {row.title}
            </Link>
            <Badge tone={STATUS_TONE[row.status]}>{row.status}</Badge>
          </div>
          <p className="mt-0.5 truncate text-xs text-neutral-500">
            {row.eyebrow ? `${row.eyebrow} · ` : ""}
            {row.href ?? "tanpa tautan"}
            {row.startDate || row.endDate
              ? ` · ${formatWibDate(row.startDate)} – ${formatWibDate(row.endDate)}`
              : ""}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <form action={toggleHomepageHighlightAction}>
          <input type="hidden" name="id" value={row.id} />
          {/* Nilai = status yang diinginkan setelah tombol ditekan. */}
          <input
            type="hidden"
            name="isPublished"
            value={row.isPublished ? "0" : "1"}
          />
          <SmallSubmit title={row.isPublished ? "Jadikan draf" : "Terbitkan"}>
            {row.isPublished ? "Jadikan draf" : "Terbitkan"}
          </SmallSubmit>
        </form>
        <form action={moveHomepageHighlightAction}>
          <input type="hidden" name="id" value={row.id} />
          <input type="hidden" name="direction" value="up" />
          <SmallSubmit title="Naikkan" disabled={index === 0}>
            ↑
          </SmallSubmit>
        </form>
        <form action={moveHomepageHighlightAction}>
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