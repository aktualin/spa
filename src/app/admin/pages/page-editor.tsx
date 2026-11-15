"use client";

import { useState } from "react";

import type { PageDraft } from "@/lib/domain/page-preview";

import { PageForm } from "./page-form";
import type { PageFormData } from "./page-form.constants";
import { PagePreviewFrame } from "./page-preview-frame";

/**
 * Editor halaman ala docs: kolom kiri form edit, kolom kanan pratinjau hidup
 * (iframe /preview/halaman yang menerima draft via postMessage). Di bawah xl
 * kolom menumpuk dan pratinjau dibuka lewat tombol.
 */
export function PageEditor({
  page,
  siteUrl,
  menuUsage = 0,
}: {
  page: PageFormData;
  siteUrl: string;
  menuUsage?: number;
}) {
  const [draft, setDraft] = useState<PageDraft>({
    title: page.title,
    template: page.template,
    status: page.status,
    seoDescription: page.seoDescription,
    bodyHtml: page.bodyHtml,
  });
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <div className="grid items-start gap-8 xl:grid-cols-2">
      <div>
        <button
          type="button"
          onClick={() => setPreviewOpen((open) => !open)}
          className="mb-4 rounded-md border border-neutral-300 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50 xl:hidden"
          aria-expanded={previewOpen}
        >
          {previewOpen ? "Tutup pratinjau" : "Lihat pratinjau"}
        </button>

        <PageForm
          page={page}
          siteUrl={siteUrl}
          menuUsage={menuUsage}
          onDraftChange={setDraft}
        />

        {previewOpen ? (
          <div className="mt-6 xl:hidden">
            <PagePreviewFrame draft={draft} />
          </div>
        ) : null}
      </div>

      <div className="hidden xl:sticky xl:top-6 xl:block">
        <PagePreviewFrame draft={draft} />
      </div>
    </div>
  );
}
