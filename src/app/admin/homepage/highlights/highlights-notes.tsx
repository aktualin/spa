import { importDefaultHighlightsAction } from "../../actions/homepage-highlights";
import { SmallSubmit } from "../../promos/_kit/form-ui";
import type { HighlightRow } from "./highlights-list";

/** Catatan saat belum ada highlight / tidak ada yang tayang. */
export function HighlightNotes({ rows, liveCount }: { rows: HighlightRow[]; liveCount: number }) {
  if (rows.length === 0) {
    return (
      <div className="mt-6 space-y-3 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <p>
          No highlights yet. Currently “What’s New” shows the site’s 3 default
          cards. As soon as the first highlight is saved, the default cards are
          <strong> replaced entirely</strong> by highlights from this list.
        </p>
        <p>
          To keep the appearance unchanged, first copy the 3 default cards into
          highlights, then edit/add as needed.
        </p>
        <form action={importDefaultHighlightsAction}>
          <SmallSubmit>Copy the 3 default cards</SmallSubmit>
        </form>
      </div>
    );
  }
  if (liveCount === 0) {
    return (
      <p className="mt-6 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-800">
        No highlights are currently published, so the “What’s New” section
        appears without cards. Publish at least one highlight, or turn off the
        “What’s New” section on the Homepage Sections page.
      </p>
    );
  }
  return null;
}