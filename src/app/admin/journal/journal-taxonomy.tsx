"use client";

import { parseJournalTags } from "@/lib/domain/journal";

import { Field, inputClass } from "../promos/_kit/form-ui";

/** Kategori (satu per artikel) + tag dengan saran tag yang sudah dipakai. */
export function CategoryTagFields({
  categories,
  categoryId,
  setCategoryId,
  tags,
  setTags,
  allTags,
}: {
  categories: { id: string; name: string; isPublished: boolean }[];
  categoryId: string;
  setCategoryId: (value: string) => void;
  tags: string;
  setTags: (value: string) => void;
  allTags: string[];
}) {
  const currentTags = parseJournalTags(tags).tags;
  const suggestedTags = allTags.filter((tag) => !currentTags.includes(tag)).slice(0, 15);
  const addTag = (tag: string) => setTags([...currentTags, tag].join(", "));

  return (
    <>
      <Field
        label="Kategori"
        htmlFor="categoryId"
        hint="Satu artikel satu kategori. Daftar dan urutannya diatur di Journal › Kategori."
      >
        <select
          id="categoryId"
          name="categoryId"
          value={categoryId}
          onChange={(event) => setCategoryId(event.target.value)}
          className={inputClass}
        >
          <option value="">Tanpa kategori</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
              {category.isPublished ? "" : " (belum terbit)"}
            </option>
          ))}
        </select>
        {categories.length === 0 ? (
          <p className="mt-1 text-xs text-neutral-500">
            Belum ada kategori. Buat dulu di Journal › Kategori bila artikel
            ini perlu dikelompokkan.
          </p>
        ) : null}
      </Field>

      <Field
        label="Tag"
        htmlFor="tags"
        hint="Pisahkan dengan koma, contoh: wellness, pijat, ritual. Disimpan dalam huruf kecil tanpa duplikat; maksimal 20 tag."
      >
        <input
          id="tags"
          name="tags"
          value={tags}
          onChange={(event) => setTags(event.target.value)}
          className={inputClass}
        />
        {suggestedTags.length > 0 ? (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-xs text-neutral-500">Tag yang sudah dipakai:</span>
            {suggestedTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => addTag(tag)}
                className="rounded-full border border-neutral-300 px-2 py-0.5 text-xs text-neutral-700 hover:bg-neutral-50"
              >
                + {tag}
              </button>
            ))}
          </div>
        ) : null}
      </Field>
    </>
  );
}