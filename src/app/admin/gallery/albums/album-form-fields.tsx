"use client";

import { ImageField } from "../../image-field";
import { Checkbox, Field, inputClass } from "../../promos/_kit/form-ui";
import { RichTextField } from "../../rich-text-field";
import type { AlbumFormData } from "./album-form";

/** Isian album: nama, slug, deskripsi, cover, urutan, dan status tayang. */
export function AlbumFields({ album }: { album: AlbumFormData }) {
  return (
    <>
      <Field label="Album name" htmlFor="name">
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
        hint="Used in the URL. Lowercase letters, numbers, and hyphens."
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
        label="Description"
        defaultValue={album.description}
        folder="gallery"
        compact
      />

      <ImageField
        name="coverUrl"
        label="Album cover"
        folder="gallery"
        defaultValue={album.coverUrl}
      />

      <Field
        label="Display order"
        htmlFor="sortOrder"
        hint="Lower values appear higher. Easier to manage with the up/down buttons in the albums list."
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
        Show on website
      </Checkbox>
    </>
  );
}