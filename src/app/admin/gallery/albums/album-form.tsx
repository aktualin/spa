"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  deleteAlbumAction,
  saveAlbumAction,
  type ActionState,
} from "../../actions/gallery";
import { ImageField } from "../../image-field";
import {
  Checkbox,
  ConfirmDeleteButton,
  ErrorAlert,
  Field,
  SaveButton,
  inputClass,
} from "../../promos/_kit/form-ui";
import { RichTextField } from "../../rich-text-field";

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

        <Field label="Nama album" htmlFor="name">
          <input
            id="name"
            name="name"
            defaultValue={album.name}
            required
            className={inputClass}
          />
        </Field>

        <Field
          label="Slug"
          htmlFor="slug"
          hint="Dipakai di URL. Huruf kecil, angka, dan tanda hubung."
        >
          <input
            id="slug"
            name="slug"
            defaultValue={album.slug}
            required
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            className={inputClass}
          />
        </Field>

        <RichTextField
          name="description"
          label="Deskripsi"
          defaultValue={album.description}
          folder="gallery"
          compact
        />

        <ImageField
          name="coverUrl"
          label="Cover album"
          folder="gallery"
          defaultValue={album.coverUrl}
        />

        <Field
          label="Urutan tampil"
          htmlFor="sortOrder"
          hint="Makin kecil makin atas. Lebih mudah diatur dengan tombol naik/turun di daftar album."
        >
          <input
            id="sortOrder"
            name="sortOrder"
            type="number"
            min={0}
            defaultValue={album.sortOrder}
            className={`${inputClass} w-28`}
          />
        </Field>

        <Checkbox name="isPublished" defaultChecked={album.isPublished}>
          Tampilkan di website
        </Checkbox>

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
