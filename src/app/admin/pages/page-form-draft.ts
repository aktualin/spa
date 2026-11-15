"use client";

import { useEffect, useRef } from "react";

import type { PageDraft } from "@/lib/domain/page-preview";

/**
 * Mengalirkan isian form terbaru ke panel pratinjau (split-view editor).
 * Callback `onDraftChange` disimpan di ref sehingga identitasnya boleh
 * berubah antar render tanpa memicu effect; pengiriman hanya terjadi saat
 * nilai draft benar-benar berubah.
 */
export function useDraftEmitter(
  onDraftChange: ((draft: PageDraft) => void) | undefined,
  draft: PageDraft,
) {
  const callbackRef = useRef(onDraftChange);
  useEffect(() => {
    callbackRef.current = onDraftChange;
  });

  const { title, template, status, seoDescription, bodyHtml } = draft;
  useEffect(() => {
    callbackRef.current?.({ title, template, status, seoDescription, bodyHtml });
  }, [title, template, status, seoDescription, bodyHtml]);
}
