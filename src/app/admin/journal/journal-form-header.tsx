"use client";

import Link from "next/link";

import { ImageField } from "../image-field";
import { RichTextField } from "../rich-text-field";
import type { JournalFormData } from "./journal-form.types";

/** Gambar sampul artikel + keterangan pemakaiannya. */
export function CoverField({ coverUrl }: { coverUrl: string }) {
  return (
    <div className="space-y-1.5">
      <ImageField
        name="coverUrl"
        label="Cover image"
        folder="journal"
        defaultValue={coverUrl}
      />
      <p className="text-xs text-neutral-500">
        Shown in the list and at the top of the article, and also used as the preview
        image when the article link is shared (WhatsApp, Facebook, etc.).
      </p>
    </div>
  );
}

/** Judul form artikel + tautan kembali. */
export function JournalFormHeader({ post }: { post: JournalFormData }) {
  return (
    <>
      <Link href="/admin/journal" className="text-sm text-neutral-600 hover:underline">
        ← Back to articles list
      </Link>

      <h1 className="mt-3 text-xl font-semibold text-neutral-900">
        {post.id ? `Edit article ${post.title}` : "Write article"}
      </h1>
    </>
  );
}

/** Isi artikel (editor teks kaya) + keterangan tombol gambar. */
export function ArticleBodyField({ bodyHtml }: { bodyHtml: string }) {
  return (
    <>
      <RichTextField
        name="bodyHtml"
        label="Article content"
        folder="journal"
        defaultValue={bodyHtml}
      />
      <p className="-mt-3 text-xs text-neutral-500">
        The <strong>Image</strong> button in the editor inserts an image inside the
        article content (JPG/PNG/WebP/AVIF/GIF, maximum 4 MB).
      </p>
    </>
  );
}