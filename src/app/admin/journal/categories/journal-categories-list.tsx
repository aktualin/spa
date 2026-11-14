import Link from "next/link";

import { moveJournalCategoryAction, type listJournalCategories } from "../../actions/journal-categories";
import { Badge } from "../../settings/_components/form-ui";

type Category = Awaited<ReturnType<typeof listJournalCategories>>[number];

function MoveButton({
  id,
  direction,
  disabled,
}: {
  id: string;
  direction: "up" | "down";
  disabled: boolean;
}) {
  const label = direction === "up" ? "Naikkan urutan" : "Turunkan urutan";
  return (
    <form action={moveJournalCategoryAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="direction" value={direction} />
      <button
        type="submit"
        disabled={disabled}
        aria-label={label}
        title={label}
        className="rounded border border-neutral-300 px-2 py-1 text-xs text-neutral-700 enabled:hover:bg-neutral-100 disabled:cursor-not-allowed disabled:text-neutral-300"
      >
        {direction === "up" ? "↑" : "↓"}
      </button>
    </form>
  );
}

/** Satu baris kategori journal: slug, jumlah artikel, dan tombol urutan. */
export function JournalCategoryRow({
  category,
  index,
  count,
}: {
  category: Category;
  index: number;
  count: number;
}) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/admin/journal/categories/${category.id}`}
            className="font-medium text-neutral-900 hover:underline"
          >
            {category.name}
          </Link>
          {!category.isPublished ? <Badge tone="warn">Disembunyikan</Badge> : null}
        </div>
        <p className="mt-0.5 font-mono text-xs text-neutral-500">{category.slug}</p>
      </div>

      <div className="flex items-center gap-3">
        <p className="text-sm text-neutral-600">{category._count.posts} artikel</p>
        <div className="flex items-center gap-1">
          <MoveButton id={category.id} direction="up" disabled={index === 0} />
          <MoveButton
            id={category.id}
            direction="down"
            disabled={index === count - 1}
          />
        </div>
      </div>
    </li>
  );
}