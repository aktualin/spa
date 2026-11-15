"use client";

import { useState } from "react";

import { buildPreviewUrl, validatePageSlug } from "@/lib/domain/page-url";

import type {
  PageFormData,
  PageStatusValue,
  PageTemplateValue,
} from "./page-form.constants";

/**
 * Seluruh state lokal PageForm, dikeluarkan ke berkas sendiri supaya
 * page-form.tsx tetap fokus pada komposisi (batas ≤100 baris per file).
 */
export function usePageFormState(page: PageFormData, siteUrl: string) {
  const isNew = page.id === null;
  const [title, setTitle] = useState(page.title);
  const [slug, setSlug] = useState(page.slug);
  const [slugEdited, setSlugEdited] = useState(!isNew || page.slug !== "");
  const [template, setTemplate] = useState<PageTemplateValue>(page.template);
  const [status, setStatus] = useState<PageStatusValue>(page.status);
  const [seoTitle, setSeoTitle] = useState(page.seoTitle);
  const [seoDescription, setSeoDescription] = useState(page.seoDescription);
  const [bodyHtml, setBodyHtml] = useState(page.bodyHtml);

  const slugError = slug === "" && !slugEdited ? null : validatePageSlug(slug);
  const previewUrl = buildPreviewUrl(siteUrl, slug);
  const slugChanged =
    page.wasPublished && !isNew && slug !== page.slug && slugError === null;

  return {
    isNew,
    title,
    setTitle,
    slug,
    setSlug,
    slugEdited,
    setSlugEdited,
    template,
    setTemplate,
    status,
    setStatus,
    seoTitle,
    setSeoTitle,
    seoDescription,
    setSeoDescription,
    bodyHtml,
    setBodyHtml,
    slugError,
    previewUrl,
    slugChanged,
  };
}
