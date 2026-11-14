"use client";

import Link from "next/link";

import { deletePostAction } from "../actions/journal";
import { ConfirmDeleteButton, SaveButton } from "../promos/_kit/form-ui";

/** Tombol simpan/preview/batal + form hapus artikel. */
export function JournalFormFooter({ postId }: { postId: string | null }) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-t border-neutral-200 pt-4">
      <SaveButton />
      {postId ? (
        <Link
          href={`/admin/journal/${postId}/preview`}
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
        >
          Lihat preview
        </Link>
      ) : null}
      <Link href="/admin/journal" className="text-sm text-neutral-600 hover:underline">
        Batal
      </Link>
    </div>
  );
}

export function JournalDeleteForm({ postId }: { postId: string }) {
  return (
    <form action={deletePostAction} className="mt-8 border-t border-neutral-200 pt-4">
      <input type="hidden" name="id" value={postId} />
      <ConfirmDeleteButton message="Hapus artikel ini? Sampul di storage juga dihapus (kecuali berkas Media Library), dan artikel tidak bisa dipulihkan.">
        Hapus artikel ini
      </ConfirmDeleteButton>
    </form>
  );
}