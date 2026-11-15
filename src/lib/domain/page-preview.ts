/**
 * Kontrak pratinjau halaman admin (split-view editor /admin/pages).
 *
 * Editor (kiri) mengirim draft yang BELUM tersimpan ke iframe pratinjau
 * (/preview/halaman) lewat postMessage; penerima memvalidasi origin dan
 * tipe pesan sebelum merender. Berkas murni — diimpor komponen klien di
 * admin maupun route pratinjau.
 */

export const PREVIEW_MESSAGE_TYPE = "kama-page-draft";

export type PageDraftTemplate = "STANDARD" | "LEGAL";
export type PageDraftStatus = "DRAFT" | "PUBLISHED";

/** Isian halaman yang dikirim editor ke panel pratinjau. */
export type PageDraft = {
  title: string;
  template: PageDraftTemplate;
  status: PageDraftStatus;
  seoDescription: string;
  bodyHtml: string;
};

export type PageDraftMessage = {
  type: typeof PREVIEW_MESSAGE_TYPE;
  draft: PageDraft;
};

/** Validasi pesan postMessage di penerima; null bila bukan pesan draft. */
export function readDraftMessage(
  origin: string,
  expectedOrigin: string,
  data: unknown,
): PageDraft | null {
  if (origin !== expectedOrigin) return null;
  const message = data as Partial<PageDraftMessage> | null;
  if (!message || message.type !== PREVIEW_MESSAGE_TYPE) return null;
  const draft = message.draft;
  if (!draft || typeof draft.title !== "string") return null;
  if (draft.template !== "STANDARD" && draft.template !== "LEGAL") return null;
  if (typeof draft.bodyHtml !== "string") return null;
  return {
    title: draft.title,
    template: draft.template,
    status: draft.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
    seoDescription:
      typeof draft.seoDescription === "string" ? draft.seoDescription : "",
    bodyHtml: draft.bodyHtml,
  };
}
