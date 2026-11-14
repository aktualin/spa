"use client";

import { ImageField } from "../../image-field";
import { Checkbox, Field, inputClass } from "../../promos/_kit/form-ui";
import { RichTextField } from "../../rich-text-field";
import type { AlbumFormData } from "./album-form";

/** Isian album: nama, slug, deskripsi, cover, urutan, dan status tayang. */
export function AlbumFields({ album }: { album: AlbumFormData }) {
  return (
    <>
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
    </>
  );
}