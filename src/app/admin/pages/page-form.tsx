"use client";

import Link from "next/link";
import { useActionState } from "react";

import type { PageDraft } from "@/lib/domain/page-preview";

import { savePageAction } from "../actions/pages";
import { RichTextField } from "../rich-text-field";
import { ErrorMessage, SaveButton } from "../settings/_components/form-ui";
import { useDraftEmitter } from "./page-form-draft";
import { initialState, type PageFormData } from "./page-form.constants";
import { PageSeoFields } from "./page-form-seo";
import { TitleSlugFields } from "./page-form-slug";
import { usePageFormState } from "./page-form-state";
import { PageDeleteForm, PageFormHeader } from "./pages-form-parts";
import { TemplateStatusFields } from "./page-form-template";

export type { PageTemplateValue, PageStatusValue, PageFormData } from "./page-form.constants";

export function PageForm({
  page,
  siteUrl,
  menuUsage = 0,
  onDraftChange,
}: {
  page: PageFormData;
  siteUrl: string;
  /** Jumlah item menu navigasi yang menunjuk halaman ini. */
  menuUsage?: number;
  /** Dipanggil setiap isian berubah — dipakai panel pratinjau split-view. */
  onDraftChange?: (draft: PageDraft) => void;
}) {
  const [state, formAction] = useActionState(savePageAction, initialState);
  const form = usePageFormState(page, siteUrl);

  useDraftEmitter(onDraftChange, {
    title: form.title,
    template: form.template,
    status: form.status,
    seoDescription: form.seoDescription,
    bodyHtml: form.bodyHtml,
  });

  return (
    <div className="mx-auto max-w-2xl">
      <PageFormHeader isNew={form.isNew} title={page.title} />

      <form action={formAction} className="mt-6 space-y-5">
        {page.id ? <input type="hidden" name="id" value={page.id} /> : null}

        <TitleSlugFields
          page={page}
          isNew={form.isNew}
          title={form.title}
          setTitle={form.setTitle}
          slug={form.slug}
          setSlug={form.setSlug}
          slugEdited={form.slugEdited}
          setSlugEdited={form.setSlugEdited}
          slugError={form.slugError}
          previewUrl={form.previewUrl}
          slugChanged={form.slugChanged}
        />

        <TemplateStatusFields
          template={form.template}
          setTemplate={form.setTemplate}
          status={form.status}
          setStatus={form.setStatus}
          menuUsage={menuUsage}
        />

        <RichTextField
          name="bodyHtml"
          label="Isi halaman"
          defaultValue={page.bodyHtml}
          folder="pages"
          onHtmlChange={form.setBodyHtml}
        />

        <PageSeoFields
          seoTitle={form.seoTitle}
          setSeoTitle={form.setSeoTitle}
          seoDescription={form.seoDescription}
          setSeoDescription={form.setSeoDescription}
        />

        <ErrorMessage error={state.error} />

        <div className="flex flex-wrap items-center gap-3 border-t border-neutral-200 pt-4">
          <SaveButton />
          <Link href="/admin/pages" className="text-sm text-neutral-600 hover:underline">
            Batal
          </Link>
        </div>
      </form>

      {page.id ? (
        <PageDeleteForm pageId={page.id} title={page.title} slug={page.slug} menuUsage={menuUsage} />
      ) : null}
    </div>
  );
}
