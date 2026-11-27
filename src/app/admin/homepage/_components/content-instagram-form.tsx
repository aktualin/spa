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
      backLabel="Back to the post list"
      heading={post.id ? "Edit Instagram post" : "Add Instagram post"}
      intro="Posts are embedded directly from Instagram in the homepage feed section. No photos are uploaded."
      id={post.id}
      formAction={formAction}
      error={state.error}
      deleteAction={deleteInstagramPostAction}
      deleteMessage="Delete this post from the feed?"
      deleteLabel="Delete this post"
    >
      <Field
        label="Instagram post URL"
        htmlFor="postUrl"
        hint="Paste the post link (Instagram → … → Copy link), e.g. https://www.instagram.com/p/Cxxxx/ — photos, reels, and IGTV are supported."
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
        Publish on the homepage
      </Checkbox>
    </Shell>
  );
}
