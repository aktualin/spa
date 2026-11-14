import type { ActionState } from "../actions/journal";

export type JournalFormData = {
  id: string | null;
  title: string;
  slug: string;
  excerpt: string;
  bodyHtml: string;
  coverUrl: string;
  categoryId: string;
  tags: string;
  status: "DRAFT" | "SCHEDULED" | "PUBLISHED";
  publishedAt: string;
  seoTitle: string;
  seoDescription: string;
  /** Artikel sedang tampil di website (menentukan peringatan ganti slug). */
  isPublic: boolean;
};

export const initialState: ActionState = { error: null };

export const statusLabel: Record<JournalFormData["status"], string> = {
  DRAFT: "Draf — tidak tampil di website",
  SCHEDULED: "Terjadwal — terbit otomatis pada tanggalnya",
  PUBLISHED: "Terbit — tampil di website",
};

export const scheduleHint: Record<JournalFormData["status"], string> = {
  DRAFT: "Opsional sebagai rencana; artikel draf tidak pernah tampil.",
  SCHEDULED:
    "Wajib. Artikel tampil otomatis pada waktu ini (WIB) tanpa perlu disimpan ulang. Bila tanggalnya sudah lewat, artikel langsung terbit.",
  PUBLISHED:
    "Kosongkan untuk memakai waktu sekarang. Bila diisi tanggal di masa depan, artikel otomatis menjadi Terjadwal.",
};