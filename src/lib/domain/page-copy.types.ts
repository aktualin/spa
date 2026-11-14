/**
 * Tipe registry teks halaman publik (`ContentBlock`) — lihat `page-copy.ts`.
 * Hanya METADATA: label, tipe isian, dan batas panjang.
 */

export type PageCopyFieldType = "text" | "textarea" | "richHtml" | "image" | "url";

export type PageCopyField = {
  key: string;
  label: string;
  type: PageCopyFieldType;
  maxLength?: number;
  hint?: string;
};

export type PageCopyGroup = {
  group: string;
  label: string;
  description?: string;
  fields: readonly PageCopyField[];
};