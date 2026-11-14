"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { buildPreviewUrl, validatePageSlug } from "@/lib/domain/page-url";

import { savePageAction } from "../actions/pages";
import { RichTextField } from "../rich-text-field";
import { ErrorMessage, SaveButton } from "../settings/_components/form-ui";
import {
  initialState,
  type PageFormData,
  type PageStatusValue,
  type PageTemplateValue,
} from "./page-form.constants";
import { PageSeoFields } from "./page-form-seo";
import { TitleSlugFields } from "./page-form-slug";
import { PageDeleteForm, PageFormHeader } from "./pages-form-parts";
import { TemplateStatusFields } from "./page-form-template";

export type { PageTemplateValue, PageStatusValue, PageFormData } from "./page-form.constants";

export function PageForm({
  page,
  siteUrl,
  menuUsage = 0,
}: {
  page: PageFormData;
  siteUrl: string;
  /** Jumlah item menu navigasi yang menunjuk halaman ini. */
  menuUsage?: number;
}) {
  const [state, formAction] = useActionState(savePageAction, initialState);

  const isNew = page.id === null;
  const [title, setTitle] = useState(page.title);
  const [slug, setSlug] = useState(page.slug);
  const [slugEdited, setSlugEdited] = useState(!isNew || page.slug !== "");
  const [template, setTemplate] = useState<PageTemplateValue>(page.template);
  const [status, setStatus] = useState<PageStatusValue>(page.status);
  const [seoTitle, setSeoTitle] = useState(page.seoTitle);
  const [seoDescription, setSeoDescription] = useState(page.seoDescription);

  const slugError = slug === "" && !slugEdited ? null : validatePageSlug(slug);
  const previewUrl = buildPreviewUrl(siteUrl, slug);
  const slugChanged =
    page.wasPublished && !isNew && slug !== page.slug && slugError === null;

  return (
    <div className="mx-auto max-w-2xl">
      <PageFormHeader isNew={isNew} title={page.title} />

      <form action={formAction} className="mt-6 space-y-5">
        {page.id ? <input type="hidden" name="id" value={page.id} /> : null}

        <TitleSlugFields
          page={page}
          isNew={isNew}
          title={title}
          setTitle={setTitle}
          slug={slug}
          setSlug={setSlug}
          slugEdited={slugEdited}
          setSlugEdited={setSlugEdited}
          slugError={slugError}
          previewUrl={previewUrl}
          slugChanged={slugChanged}
        />

        <TemplateStatusFields
          template={template}
          setTemplate={setTemplate}
          status={status}
          setStatus={setStatus}
          menuUsage={menuUsage}
        />

        <RichTextField
          name="bodyHtml"
          label="Isi halaman"
          defaultValue={page.bodyHtml}
          folder="pages"
        />

        <PageSeoFields
          seoTitle={seoTitle}
          setSeoTitle={setSeoTitle}
          seoDescription={seoDescription}
          setSeoDescription={setSeoDescription}
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