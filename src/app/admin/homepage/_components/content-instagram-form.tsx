"use client";

import { useActionState } from "react";

import { INSTAGRAM_LIMITS } from "@/lib/domain/homepage";

import {
  deleteInstagramPostAction,
  saveInstagramPostAction,
} from "../../actions/homepage-content";
import { ImageField } from "../../image-field";
import { Checkbox, Field, inputClass } from "../../promos/_kit/form-ui";
import { Shell, initialState } from "./content-form-shell";

export type InstagramFormData = {
  id: string | null;
  imageUrl: string;
  imageAlt: string;
  href: string;
  isPublished: boolean;
};

export function InstagramForm({ post }: { post: InstagramFormData }) {
  const [state, formAction] = useActionState(saveInstagramPostAction, initialState);
  return (
    <Shell
      listPath="/admin/homepage/instagram"
      backLabel="Kembali ke daftar foto"
      heading={post.id ? "Ubah foto Instagram" : "Tambah foto Instagram"}
      intro="Tampil sebagai kotak foto persegi di section feed Instagram."
      id={post.id}
      formAction={formAction}
      error={state.error}
      deleteAction={deleteInstagramPostAction}
      deleteMessage="Hapus foto ini dari feed? Gambar yang tercatat di Media Library tetap tersimpan."
      deleteLabel="Hapus foto ini"
    >
      <fieldset className="space-y-4 rounded-md border border-neutral-200 p-4">
        <legend className="px-1 text-sm font-medium text-neutral-700">Foto</legend>
        <ImageField
          name="imageUrl"
          label="Foto feed"
          folder="instagram"
          defaultValue={post.imageUrl}
        />
        <p className="text-xs text-neutral-500">
          Dipotong persegi 1:1. Disarankan minimal 800×800 px, JPG/WebP di bawah 1 MB.
        </p>
        <Field
          label="Teks alt (opsional)"
          htmlFor="imageAlt"
          hint="Deskripsi singkat foto untuk pembaca layar. Kosong = foto dianggap hiasan."
        >
          <input
            id="imageAlt"
            name="imageAlt"
            defaultValue={post.imageAlt}
            maxLength={INSTAGRAM_LIMITS.imageAlt}
            className={inputClass}
          />
        </Field>
      </fieldset>
      <Field
        label="Tautan postingan (opsional)"
        htmlFor="href"
        hint="https://… ke postingan Instagram. Kosong = tautan profil Instagram (dari Kontak & Umum)."
      >
        <input
          id="href"
          name="href"
          defaultValue={post.href}
          maxLength={INSTAGRAM_LIMITS.href}
          className={inputClass}
        />
      </Field>
      <Checkbox name="isPublished" defaultChecked={post.isPublished}>
        Terbitkan di homepage
      </Checkbox>
    </Shell>
  );
}