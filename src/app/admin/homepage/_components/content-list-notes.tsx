import type { ReactNode } from "react";

import { SmallSubmit } from "../../promos/_kit/form-ui";

/** Catatan saat daftar kosong (dengan tombol salin bawaan) atau tak ada yang tayang. */
export function ContentListNotes({
  isEmpty,
  liveCount,
  emptyNote,
  importLabel,
  importAction,
  noLiveNote,
}: {
  isEmpty: boolean;
  liveCount: number;
  emptyNote: ReactNode;
  importLabel: string;
  importAction: () => void | Promise<void>;
  noLiveNote: ReactNode;
}) {
  if (isEmpty) {
    return (
      <div className="mt-6 space-y-3 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-800">
        {emptyNote}
        <form action={importAction}>
          <SmallSubmit>{importLabel}</SmallSubmit>
        </form>
      </div>
    );
  }
  if (liveCount === 0) {
    return (
      <p className="mt-6 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-800">
        {noLiveNote}
      </p>
    );
  }
  return null;
}