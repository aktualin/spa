"use client";

import { useActionState, useState } from "react";

import { resolveJournalSlug } from "@/lib/domain/journal";

import { savePostAction } from "../actions/journal";
import { ErrorAlert } from "../promos/_kit/form-ui";
import { initialState, type JournalFormData } from "./journal-form.types";
import { JournalFormFooter, JournalDeleteForm } from "./journal-form-footer";
import { ArticleBodyField, CoverField, JournalFormHeader } from "./journal-form-header";
import { JournalSeoFields } from "./journal-seo";
import { StatusFields } from "./journal-status-fields";
import { CategoryTagFields } from "./journal-taxonomy";
import { ExcerptField, TitleSlugFields } from "./journal-title";

export type { JournalFormData } from "./journal-form.types";

export function JournalForm({
  post,
  taxonomy,
}: {
  post: JournalFormData;
  taxonomy: {
    categories: { id: string; name: string; isPublished: boolean }[];
    tags: string[];
  };
}) {
  const [state, formAction] = useActionState(savePostAction, initialState);
  const [status, setStatus] = useState<JournalFormData["status"]>(post.status);
  const [title, setTitle] = useState(post.title);
  const [slug, setSlug] = useState(post.slug);
  const [excerpt, setExcerpt] = useState(post.excerpt);
  const [tags, setTags] = useState(post.tags);
  // Field dibuat terkendali supaya isian tidak hilang ketika simpan ditolak
  // (React mengosongkan field tak terkendali setelah form action selesai).
  const [categoryId, setCategoryId] = useState(post.categoryId);
  const [publishedAt, setPublishedAt] = useState(post.publishedAt);
  const [seoTitle, setSeoTitle] = useState(post.seoTitle);
  const [seoDescription, setSeoDescription] = useState(post.seoDescription);

  const effectiveSlug = resolveJournalSlug(slug, title);
  const slugChanged = post.isPublic && post.slug !== "" && effectiveSlug !== post.slug;

  return (
    <div className="mx-auto max-w-2xl">
      <JournalFormHeader post={post} />

      <form action={formAction} className="mt-6 space-y-5">
        {post.id ? <input type="hidden" name="id" value={post.id} /> : null}

        <TitleSlugFields
          post={post}
          title={title}
          setTitle={setTitle}
          slug={slug}
          setSlug={setSlug}
          effectiveSlug={effectiveSlug}
          slugChanged={slugChanged}
        />

        <ExcerptField excerpt={excerpt} setExcerpt={setExcerpt} />

        <ArticleBodyField bodyHtml={post.bodyHtml} />

        <CoverField coverUrl={post.coverUrl} />

        <CategoryTagFields
          categories={taxonomy.categories}
          categoryId={categoryId}
          setCategoryId={setCategoryId}
          tags={tags}
          setTags={setTags}
          allTags={taxonomy.tags}
        />

        <StatusFields
          status={status}
          setStatus={setStatus}
          publishedAt={publishedAt}
          setPublishedAt={setPublishedAt}
        />

        <JournalSeoFields
          seoTitle={seoTitle}
          setSeoTitle={setSeoTitle}
          seoDescription={seoDescription}
          setSeoDescription={setSeoDescription}
          title={title}
          excerpt={excerpt}
          effectiveSlug={effectiveSlug}
        />

        <ErrorAlert message={state.error} />

        <JournalFormFooter postId={post.id} />
      </form>

      {post.id ? <JournalDeleteForm postId={post.id} /> : null}
    </div>
  );
}