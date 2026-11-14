"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  deleteAlbumAction,
  saveAlbumAction,
  type ActionState,
} from "../../actions/gallery";
import {
  ConfirmDeleteButton,
  ErrorAlert,
  SaveButton,
} from "../../promos/_kit/form-ui";
import { AlbumFields } from "./album-form-fields";

export type AlbumFormData = {
  id: string | null;
  slug: string;
  name: string;
  description: string;
  coverUrl: string;
  isPublished: boolean;
  sortOrder: number;
};

const initialState: ActionState = { error: null };

export function AlbumForm({ album }: { album: AlbumFormData }) {
  const [state, formAction] = useActionState(saveAlbumAction, initialState);

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/gallery" className="text-sm text-neutral-600 hover:underline">
        ← Kembali ke daftar album
      </Link>

      <h1 className="mt-3 text-xl font-semibold text-neutral-900">
        {album.id ? `Ubah album ${album.name}` : "Tambah album"}
      </h1>

      <form action={formAction} className="mt-6 space-y-5">
        {album.id ? <input type="hidden" name="id" value={album.id} /> : null}

        <AlbumFields album={album} />

        <ErrorAlert message={state.error} />

        <div className="flex items-center gap-3 border-t border-neutral-200 pt-4">
          <SaveButton />
          <Link href="/admin/gallery" className="text-sm text-neutral-600 hover:underline">
            Batal
          </Link>
        </div>
      </form>

      {album.id ? (
        <form action={deleteAlbumAction} className="mt-8 border-t border-neutral-200 pt-4">
          <input type="hidden" name="id" value={album.id} />
          <ConfirmDeleteButton message="Hapus album ini? Semua foto di dalamnya ikut terhapus.">
            Hapus album ini
          </ConfirmDeleteButton>
        </form>
      ) : null}
    </div>
  );
}