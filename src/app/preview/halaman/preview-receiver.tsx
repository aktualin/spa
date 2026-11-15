"use client";

import { useEffect, useState } from "react";

import { readDraftMessage, type PageDraft } from "@/lib/domain/page-preview";

import { LegalPreview, StandardPreview } from "./preview-templates";

type CopyStrings = { eyebrow: string; emptyBody: string; updatedLabel: string };

/**
 * Penerima draft dari editor /admin/pages (postMessage, origin divalidasi
 * readDraftMessage). Template dipilih sesuai pilihan admin; markup adalah
 * replika halaman publik — lihat ./preview-templates.
 */
export function PreviewReceiver(props: CopyStrings) {
  const [draft, setDraft] = useState<PageDraft | null>(null);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const next = readDraftMessage(event.origin, window.location.origin, event.data);
      if (next) setDraft(next);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  if (!draft) {
    return (
      <p className="p-6 text-sm text-neutral-400">Menunggu konten dari editor…</p>
    );
  }

  const Template = draft.template === "LEGAL" ? LegalPreview : StandardPreview;
  return <Template draft={draft} {...props} />;
}
