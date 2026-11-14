import Link from "next/link";

import { SmallSubmit } from "../../promos/_kit/form-ui";
import { Badge, Thumb } from "../../promos/_kit/list-ui";
import type { ContentListRow } from "./content-list";

type FormAction = (formData: FormData) => void | Promise<void>;

/** Satu baris daftar konten homepage: status, terbitkan/draf, dan urutan. */
export function ContentRow({
  row,
  index,
  count,
  basePath,
  toggleAction,
  moveAction,
}: {
  row: ContentListRow;
  index: number;
  count: number;
  basePath: string;
  toggleAction: FormAction;
  moveAction: FormAction;
}) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        {row.thumb !== undefined ? <Thumb src={row.thumb} alt="" /> : null}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`${basePath}/${row.id}`}
              className="font-medium text-neutral-900 hover:underline"
            >
              {row.title}
            </Link>
            <Badge tone={row.isPublished ? "green" : "muted"}>
              {row.isPublished ? "Tayang" : "Draf"}
            </Badge>
          </div>
          <p className="mt-0.5 truncate text-xs text-neutral-500">{row.meta}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <form action={toggleAction}>
          <input type="hidden" name="id" value={row.id} />
          <input type="hidden" name="isPublished" value={row.isPublished ? "0" : "1"} />
          <SmallSubmit title={row.isPublished ? "Jadikan draf" : "Terbitkan"}>
            {row.isPublished ? "Jadikan draf" : "Terbitkan"}
          </SmallSubmit>
        </form>
        <form action={moveAction}>
          <input type="hidden" name="id" value={row.id} />
          <input type="hidden" name="direction" value="up" />
          <SmallSubmit title="Naikkan" disabled={index === 0}>
            ↑
          </SmallSubmit>
        </form>
        <form action={moveAction}>
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