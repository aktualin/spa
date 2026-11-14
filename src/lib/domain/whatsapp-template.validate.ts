/** Validasi isi template WhatsApp — lihat `whatsapp-template.ts`. */
import {
  allowedPlaceholders,
  getContextDefinition,
} from "./whatsapp-template.contexts.ts";
import {
  MAX_TEMPLATE_LENGTH,
  PLACEHOLDER_RE,
  extractPlaceholders,
} from "./whatsapp-template.render.ts";
import type { WhatsAppContextKey } from "./whatsapp-template.types.ts";

export type TemplateValidation = {
  /** Kesalahan yang membuat template ditolak. */
  errors: string[];
  /** Hal yang perlu diperhatikan, tetapi template tetap boleh disimpan. */
  warnings: string[];
};

/** Validasi isi template untuk sebuah konteks. */
export function validateTemplate(
  key: WhatsAppContextKey,
  message: string,
): TemplateValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  const text = message.trim();

  if (!text) errors.push("Isi pesan wajib diisi.");
  if (text.length > MAX_TEMPLATE_LENGTH) {
    errors.push(
      `Pesan terlalu panjang (${text.length} karakter, maksimal ${MAX_TEMPLATE_LENGTH}).`,
    );
  }

  // Kurung kurawal yang tersisa setelah placeholder valid dibuang = salah tulis.
  if (/\{\{|\}\}/.test(text.replace(PLACEHOLDER_RE, ""))) {
    errors.push(
      "Penulisan placeholder tidak lengkap. Gunakan bentuk {{nama}} dengan dua kurung kurawal di kedua sisi.",
    );
  }

  const allowed = allowedPlaceholders(key);
  const unknown = extractPlaceholders(text).filter((name) => !allowed.includes(name));
  if (unknown.length > 0) {
    const list = unknown.map((name) => `{{${name}}}`).join(", ");
    errors.push(
      allowed.length > 0
        ? `Placeholder tidak dikenal: ${list}. Yang tersedia: ${getContextDefinition(key)
            .placeholders.map((placeholder) => `{{${placeholder.name}}}`)
            .join(", ")}.`
        : `Placeholder tidak dikenal: ${list}. Template ini tidak memakai placeholder.`,
    );
  }

  const context = getContextDefinition(key);
  if (context.primary && text && !extractPlaceholders(text).includes(context.primary)) {
    const acceptedAlias =
      key === "retail" &&
      extractPlaceholders(text).some((name) => ["produk", "nama", "name"].includes(name));
    if (!acceptedAlias) {
      warnings.push(
        key === "retail"
          ? `Pesan tidak memuat {{${context.primary}}}; halaman Retail akan tetap memakai teks bawaan.`
          : `Pesan tidak memuat {{${context.primary}}}, jadi tamu tidak menyebut nama yang dipilih.`,
      );
    }
  }

  return { errors, warnings };
}