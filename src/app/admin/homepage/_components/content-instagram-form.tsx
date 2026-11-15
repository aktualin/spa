"use client";

import { useActionState } from "react";

import { INSTAGRAM_LIMITS } from "@/lib/domain/homepage";

import {
  deleteInstagramPostAction,
  saveInstagramPostAction,
} from "../../actions/homepage-content";
import { Checkbox, Field, inputClass } from "../../promos/_kit/form-ui";
import { Shell, initialState } from "./content-form-shell";

export type InstagramFormData = {
  id: string | null;
  postUrl: string;
  isPublished: boolean;
};

export function InstagramForm({ post }: { post: InstagramFormData }) {
  const [state, formAction] = useActionState(saveInstagramPostAction, initialState);
  return (
    <Shell
      listPath="/admin/homepage/instagram"
      backLabel="Kembali ke daftar postingan"
      heading={post.id ? "Ubah postingan Instagram" : "Tambah postingan Instagram"}
      intro="Postingan di-embed langsung dari Instagram di section feed homepage. Tidak ada foto yang diunggah."
      id={post.id}
      formAction={formAction}
      error={state.error}
      deleteAction={deleteInstagramPostAction}
      deleteMessage="Hapus postingan ini dari feed?"
      deleteLabel="Hapus postingan ini"
    >
      <Field
        label="URL postingan Instagram"
        htmlFor="postUrl"
        hint="Tempel tautan postingan (Instagram → … → Salin tautan), mis. https://www.instagram.com/p/Cxxxx/ — foto, reel, dan IGTV didukung."
      >
        <input
          id="postUrl"
          name="postUrl"
          type="url"
          inputMode="url"
          required
          placeholder="https://www.instagram.com/p/…"
          defaultValue={post.postUrl}
          maxLength={INSTAGRAM_LIMITS.postUrl}
          className={inputClass}
        />
      </Field>
      <Checkbox name="isPublished" defaultChecked={post.isPublished}>
        Terbitkan di homepage
      </Checkbox>
    </Shell>
  );
}
